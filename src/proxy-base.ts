import { given } from "@nivinjoseph/n-defensive";
import { makeObservable, observable, runInAction } from "mobx";
import type { RpcClient } from "./rpc-client.js";

// Keys of T whose values are not functions — so `copyValue` only offers data
// properties for completion and the type never advertises a key it would reject.
type DataKeys<T> = { [K in keyof T]: T[K] extends (...args: Array<any>) => any ? never : K }[keyof T];

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
export abstract class ProxyBase<TDto extends object>
{
    private readonly _backups = new Array<TDto>();
    private readonly _rpcClient: RpcClient;
    private _dto: TDto;

    protected get rpcClient(): RpcClient { return this._rpcClient; }
    
    protected get dto(): TDto
    {
        return this._dto;
    }
    protected set dto(value: TDto)
    {
        given(value as object, "value").ensureHasValue().ensureIsObject();
        runInAction(() =>
        {
            this._dto = value;
        });
    }

    public constructor(rpcClient: RpcClient, dto?: TDto)
    {
        given(rpcClient, "rpcClient").ensureHasValue().ensureIsObject();
        this._rpcClient = rpcClient;
        
        dto ??= {} as any;
        given(dto as object, "dto").ensureHasValue().ensureIsObject();
        this._dto = dto!;

        makeObservable<ProxyBase<TDto>, "_dto">(this, {
            _dto: observable.ref,
        });
    }
    
    // Deep clone of the entire backing DTO, in DTO shape.
    public cloneValue(): TDto
    {
        return structuredClone(this.dto);
    }

    // Deep clone of the named properties read through this proxy, in proxy shape.
    // Only data (non-method) keys are accepted — see the `DataKeys` constraint.
    public copyValue<K extends DataKeys<this>>(...keys: Array<K>): Pick<this, K>
    {
        given(keys, "keys").ensureHasValue().ensureIsArray()
            .ensure(t => t.isNotEmpty, "must specify at least one key")
            .ensure(t => t.every(key => typeof this[key] !== "function"),
                "cannot copy method keys; only data properties are allowed");

        const result = {} as Pick<this, K>;
        for (const key of keys)
            result[key] = structuredClone(this[key]);

        return result;
    }

    // Push a deep snapshot of the current DTO onto the backup stack. Nestable:
    // each call adds a level that a matching restoreValue() pops.
    protected backupValue(): void
    {
        this._backups.push(structuredClone(this.dto));
    }

    // Pop the most recent snapshot and make it the current DTO. No-ops with a
    // warning when there is nothing backed up.
    protected restoreValue(): void
    {
        if (this._backups.isEmpty)
        {
            console.warn(`[${(<Object>this).getTypeName()}] restoreValue() called but there is no backup to restore.`);
            return;
        }

        this.dto = this._backups.pop()!;
    }

    // Re-fetch the DTO from the server and swap it in via the `dto` setter.
    protected abstract refreshValue(): Promise<void>;
}