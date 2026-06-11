import { RpcException } from "./rpc-exception.js";
export type RpcErrorHandler = (exp: RpcException) => boolean;
type QueryEndpointShape = {
    readonly route: string;
    readonly params: object;
    readonly res: unknown;
};
type CommandEndpointShape = QueryEndpointShape & {
    readonly req: unknown;
};
type ParamsArg<TParams> = keyof TParams extends never ? [] : [params: TParams];
export declare class RpcClient {
    private static readonly _timeoutMs;
    private readonly _baseUrl;
    private readonly _headers;
    private _errorHandler;
    constructor(baseURL?: string);
    setHeader(key: string, value: string | null): void;
    registerErrorHandler(handler: RpcErrorHandler): void;
    query<TEndpoint extends QueryEndpointShape>(route: TEndpoint["route"], ...args: ParamsArg<TEndpoint["params"]>): Promise<TEndpoint["res"]>;
    command<TEndpoint extends CommandEndpointShape>(route: TEndpoint["route"], body: TEndpoint["req"], ...args: ParamsArg<TEndpoint["params"]>): Promise<TEndpoint["res"]>;
    private _buildUrl;
    private _request;
    private _readErrorBody;
}
export {};
//# sourceMappingURL=rpc-client.d.ts.map