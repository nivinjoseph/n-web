import { given } from "@nivinjoseph/n-defensive";
import { type CommandEndpoint } from "./command-controller.js";
import { type QueryEndpoint } from "./query-controller.js";
import { RpcException, type RpcExceptionData } from "./rpc-exception.js";
import { Utils } from "./utils.js";

// public
export type RpcErrorHandler = (exp: RpcException) => boolean;

// A route with no params (`{}`) takes no params argument; one with params requires it.
// `keyof TParams extends never` distinguishes the two.
type ParamsArg<TParams> = keyof TParams extends never ? [] : [params: TParams];

// public
// A type-safe RPC client. Each call is parameterized by a single endpoint type
// (`QueryEndpoint`/`CommandEndpoint`) which bundles the route literal with its resolved params,
// request body, and response body — so the route, params, request, and response are all validated
// together against the server contract.
export class RpcClient
{
    private static readonly _timeoutMs: number = 60000;

    private readonly _baseUrl: string | null;
    private readonly _headers: { [index: string]: string; };

    private _errorHandler: RpcErrorHandler | null = null;

    public constructor(baseURL?: string)
    {
        given(baseURL, "baseURL").ensureIsString();

        // strip trailing slash(es) so joining with a route (which always starts with "/") can't
        // produce a double slash
        this._baseUrl = baseURL?.trim().replace(/\/+$/, "") ?? null;
        this._headers = {};
    }

    public setHeader(key: string, value: string | null): void
    {
        given(key, "key").ensureHasValue().ensureIsString();
        given(value as string, "value").ensureIsString();

        if (value == null) delete this._headers[key];
        else this._headers[key] = value;
    }

    public registerErrorHandler(handler: RpcErrorHandler): void
    {
        given(handler, "handler").ensureHasValue().ensureIsFunction();
        given(this, "this").ensure((t) => t._errorHandler == null);

        this._errorHandler = handler;
    }

    public async query<TEndpoint extends QueryEndpoint<string, any>>(
        route: TEndpoint["route"],
        ...args: ParamsArg<TEndpoint["params"]>
    ): Promise<TEndpoint["res"]>
    {
        const url = this._buildUrl(route, args);

        return this._request<TEndpoint["res"]>("GET", url, null);
    }

    public async command<TEndpoint extends CommandEndpoint<string, any>>(
        route: TEndpoint["route"],
        body: TEndpoint["req"],
        ...args: ParamsArg<TEndpoint["params"]>
    ): Promise<TEndpoint["res"]>
    {
        given(body as object, "body").ensureHasValue().ensureIsObject();

        const url = this._buildUrl(route, args);

        return this._request<TEndpoint["res"]>("POST", url, body);
    }

    private _buildUrl(route: string, args: ReadonlyArray<object>): string
    {
        given(route, "route")
            .ensureHasValue()
            .ensureIsString()
            .ensure((t) => t.trim().startsWith("/"), "must start with '/'");

        route = route.trim();

        const [params] = args as [Record<string, string | number | boolean | null | undefined>?];

        return params != null ? Utils.generateUrl(route, params) : route;
    }

    private async _request<T>(
        method: "GET" | "POST",
        url: string,
        body: unknown
    ): Promise<T>
    {
        const fullUrl = this._baseUrl != null ? this._baseUrl + url : url;

        const headers: { [index: string]: string; } = { ...this._headers };
        if (body != null) headers["Content-Type"] = "application/json";

        const response = await fetch(fullUrl, {
            method,
            headers,
            body: body != null ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(RpcClient._timeoutMs),
        });

        if (!response.ok)
        {
            const data = await this._readErrorBody(response);
            console.warn("RPC ERROR", response.status, data);
            const exp = new RpcException(response.status, data);

            if (this._errorHandler != null)
            {
                const result = this._errorHandler(exp);
                if (!result) throw exp;

                return null as unknown as T;
            }
            else
            {
                throw exp;
            }
        }

        // response.json() throws SyntaxError: Unexpected end of JSON input on an empty body
        // (e.g. a 204, or a command handler that returns nothing).
        // It's only safe when the server guarantees a JSON body.
        if (response.status === 204) return undefined as T;

        return (await response.json()) as T;
    }

    private async _readErrorBody(
        response: Response
    ): Promise<RpcExceptionData | null>
    {
        try
        {
            return (await response.json()) as RpcExceptionData;
        }
        catch
        {
            return null;
        }
    }
}
