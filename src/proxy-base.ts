import { given } from "@nivinjoseph/n-defensive";
import { makeObservable, observable, runInAction } from "mobx";

/**
 * Base for proxies that wrap a server DTO and re-fetch on mutate. The whole
 * DTO is swapped on refresh, so it is tracked by reference (`observable.ref`).
 * Subclasses read fields through the protected `dto` getter (as `computed`
 * accessors they annotate themselves) and replace it through the setter, which
 * does the `runInAction` write.
 */
export abstract class ProxyBase<TDto extends object>
{
    private _dto: TDto;

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

    protected constructor(dto: TDto)
    {
        given(dto as object, "dto").ensureHasValue().ensureIsObject();
        this._dto = dto;

        makeObservable<ProxyBase<TDto>, "_dto">(this, {
            _dto: observable.ref,
        });
    }
}