"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("n-ext");
const n_defensive_1 = require("n-defensive");
const http_redirect_exception_1 = require("./http-redirect-exception");
// public
class Controller {
    // protected generateUrl(route: string, params?: object, baseUrl?: string): string
    // {
    //     return Utils.generateUrl(route, params, baseUrl);
    // }
    redirect(url) {
        n_defensive_1.given(url, "url").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        throw new http_redirect_exception_1.HttpRedirectException(url.trim());
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map