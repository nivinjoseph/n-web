"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("n-ext");
const n_defensive_1 = require("n-defensive");
const route_info_1 = require("./route-info");
const http_redirect_exception_1 = require("./http-redirect-exception");
// public
class Controller {
    generateUrl(route, params, baseUrl) {
        n_defensive_1.given(route, "route").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        route = route.trim();
        if (baseUrl !== undefined && baseUrl != null) {
            baseUrl = baseUrl.trim();
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            route = baseUrl + route;
        }
        if (params == null)
            return route;
        return new route_info_1.RouteInfo(route).generateUrl(params);
    }
    redirect(url) {
        n_defensive_1.given(url, "url").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        throw new http_redirect_exception_1.HttpRedirectException(url.trim());
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map