import { given } from "@nivinjoseph/n-defensive";
import { RpcException } from "./rpc-exception.js";
import { Utils } from "./utils.js";
// public
// A type-safe RPC client. Each call is parameterized by a single endpoint type
// (`QueryEndpoint`/`CommandEndpoint`) which bundles the route literal with its resolved params,
// request body, and response body — so the route, params, request, and response are all validated
// together against the server contract.
export class RpcClient {
    static _timeoutMs = 60000;
    _baseUrl;
    _headers;
    _errorHandler = null;
    constructor(baseURL) {
        given(baseURL, "baseURL").ensureIsString();
        // strip trailing slash(es) so joining with a route (which always starts with "/") can't
        // produce a double slash
        this._baseUrl = baseURL?.trim().replace(/\/+$/, "") ?? null;
        this._headers = {};
    }
    setHeader(key, value) {
        given(key, "key").ensureHasValue().ensureIsString();
        given(value, "value").ensureIsString();
        if (value == null)
            delete this._headers[key];
        else
            this._headers[key] = value;
    }
    registerErrorHandler(handler) {
        given(handler, "handler").ensureHasValue().ensureIsFunction();
        given(this, "this").ensure((t) => t._errorHandler == null);
        this._errorHandler = handler;
    }
    async query(route, ...args) {
        const url = this._buildUrl(route, args);
        return this._request("GET", url, null);
    }
    async command(route, body, ...args) {
        given(body, "body").ensureHasValue().ensureIsObject();
        const url = this._buildUrl(route, args);
        return this._request("POST", url, body);
    }
    _buildUrl(route, args) {
        given(route, "route")
            .ensureHasValue()
            .ensureIsString()
            .ensure((t) => t.trim().startsWith("/"), "must start with '/'");
        route = route.trim();
        const [params] = args;
        return params != null ? Utils.generateUrl(route, params) : route;
    }
    async _request(method, url, body) {
        const fullUrl = this._baseUrl != null ? this._baseUrl + url : url;
        const headers = { ...this._headers };
        if (body != null)
            headers["Content-Type"] = "application/json";
        const response = await fetch(fullUrl, {
            method,
            headers,
            body: body != null ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(RpcClient._timeoutMs),
        });
        if (!response.ok) {
            const data = await this._readErrorBody(response);
            console.warn("RPC ERROR", response.status, data);
            const exp = new RpcException(response.status, data);
            if (this._errorHandler != null) {
                const result = this._errorHandler(exp);
                if (!result)
                    throw exp;
                return null;
            }
            else {
                throw exp;
            }
        }
        // response.json() throws SyntaxError: Unexpected end of JSON input on an empty body
        // (e.g. a 204, or a command handler that returns nothing).
        // It's only safe when the server guarantees a JSON body.
        if (response.status === 204)
            return undefined;
        return (await response.json());
    }
    async _readErrorBody(response) {
        try {
            return (await response.json());
        }
        catch {
            return null;
        }
    }
}
//# sourceMappingURL=rpc-client.js.map