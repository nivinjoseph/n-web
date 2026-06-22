import type { RpcClient } from "./rpc-client.js";
/**
 * Base for proxies that wrap a server DTO and re-fetch on mutate. The whole
 * DTO is swapped on refresh, so it is tracked by reference (`observable.ref`).
 * Subclasses read fields through the protected `dto` getter (as `computed`
 * accessors they annotate themselves) and replace it through the setter, which
 * does the `runInAction` write.
 */
export declare abstract class ProxyBase<TDto extends object> {
    private readonly _rpcClient;
    private _dto;
    protected get rpcClient(): RpcClient;
    protected get dto(): TDto;
    protected set dto(value: TDto);
    protected constructor(rpcClient: RpcClient, dto?: TDto);
    protected abstract refresh(): Promise<void>;
}
//# sourceMappingURL=proxy-base.d.ts.map