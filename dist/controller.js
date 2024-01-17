import { given } from "@nivinjoseph/n-defensive";
import { HttpRedirectException } from "./exceptions/http-redirect-exception.js";
// public
export class Controller {
    // protected generateUrl(route: string, params?: object, baseUrl?: string): string
    // {
    //     return Utils.generateUrl(route, params, baseUrl);
    // }
    redirect(url) {
        given(url, "url").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        throw new HttpRedirectException(url.trim());
    }
    disableCompression() {
        given(this, "this").ensure(t => t.__ctx != null, "cannot invoke method before context is set");
        this.__ctx.compress = false;
    }
}
//# sourceMappingURL=controller.js.map