import { given } from "@nivinjoseph/n-defensive";
import { HttpRedirectException } from "./exceptions/http-redirect-exception.js";
// Controller is a transitive dependency of every decorated controller and every decorator,
// so its module body is guaranteed to run before any controller class is decorated. This is
// the earliest reliable point to install the Symbol.metadata polyfill that the decorators rely on.
//@ts-expect-error polyfill to use metadata object
Symbol.metadata ??= Symbol("Symbol.metadata");
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