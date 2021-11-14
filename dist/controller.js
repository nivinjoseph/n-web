"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
require("@nivinjoseph/n-ext");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const http_redirect_exception_1 = require("./exceptions/http-redirect-exception");
// public
class Controller {
    // protected generateUrl(route: string, params?: object, baseUrl?: string): string
    // {
    //     return Utils.generateUrl(route, params, baseUrl);
    // }
    redirect(url) {
        (0, n_defensive_1.given)(url, "url").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        throw new http_redirect_exception_1.HttpRedirectException(url.trim());
    }
    disableCompression() {
        (0, n_defensive_1.given)(this, "this").ensure(t => t.__ctx != null, "cannot invoke method before context is set");
        this.__ctx.compress = false;
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map