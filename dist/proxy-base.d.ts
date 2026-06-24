import type { RpcClient } from "./rpc-client.js";
type DataKeys<T> = {
    [K in keyof T]: T[K] extends (...args: Array<any>) => any ? never : K;
}[keyof T];
/**
 * Base for proxies that wrap a server DTO and re-fetch on mutate. The whole
 * DTO is swapped on refresh, so it is tracked by reference (`observable.ref`).
 * Subclasses read fields through the protected `dto` getter (as `computed`
 * accessors they annotate themselves) and replace it through the setter, which
 * does the `runInAction` write.
 *
 * The public surface is read-only snapshotting: `cloneValue()` deep-copies the
 * whole backing DTO (in DTO shape), while `copyValue(...keys)` deep-copies a
 * subset of the proxy's own exposed properties (in proxy shape). The protected
 * lifecycle — `backupValue()` / `restoreValue()` (a LIFO snapshot stack used for
 * optimistic-edit rollback) and the abstract `refreshValue()` — is for
 * subclasses to orchestrate.
 *
 * NOTE: all snapshotting uses `structuredClone`, so `TDto` (and any copied
 * property) must be structured-cloneable — plain data, `Date`, `Map`, `Set`,
 * typed arrays, etc. Functions and class instances throw at runtime.
 */
export declare abstract class ProxyBase<TDto extends object> {
    private readonly _backups;
    private readonly _rpcClient;
    private _dto;
    protected get rpcClient(): RpcClient;
    protected get dto(): TDto;
    protected set dto(value: TDto);
    constructor(rpcClient: RpcClient, dto?: TDto);
    cloneValue(): TDto;
    copyValue<K extends DataKeys<this>>(...keys: Array<K>): Pick<this, K>;
    protected backupValue(): void;
    protected restoreValue(): void;
    protected abstract refreshValue(): Promise<void>;
}
export {};
//# sourceMappingURL=proxy-base.d.ts.map