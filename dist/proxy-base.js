import { given } from "@nivinjoseph/n-defensive";
import { makeObservable, observable, runInAction } from "mobx";
/**
 * Base for proxies that wrap a server DTO and re-fetch on mutate. The whole
 * DTO is swapped on refresh, so it is tracked by reference (`observable.ref`).
 * Subclasses read fields through the protected `dto` getter (as `computed`
 * accessors they annotate themselves) and replace it through the setter, which
 * does the `runInAction` write.
 */
export class ProxyBase {
    _dto;
    get dto() {
        return this._dto;
    }
    set dto(value) {
        given(value, "value").ensureHasValue().ensureIsObject();
        runInAction(() => {
            this._dto = value;
        });
    }
    constructor(dto) {
        given(dto, "dto").ensureHasValue().ensureIsObject();
        this._dto = dto;
        makeObservable(this, {
            _dto: observable.ref,
        });
    }
}
//# sourceMappingURL=proxy-base.js.map