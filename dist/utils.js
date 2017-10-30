"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_info_1 = require("./route-info");
const n_defensive_1 = require("n-defensive");
// public
class Utils // static class
 {
    static generateUrl(route, params, baseUrl) {
        n_defensive_1.given(route, "route").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        if (params)
            n_defensive_1.given(params, "params").ensureIsObject();
        if (baseUrl)
            n_defensive_1.given(baseUrl, "baseUrl").ensureIsString();
        route = route.trim();
        if (baseUrl !== undefined && baseUrl != null && !baseUrl.isEmptyOrWhiteSpace()) {
            baseUrl = baseUrl.trim();
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            if (route.startsWith("/"))
                route = route.substr(1, route.length - 1);
            // special treatment for the sake of docker routing on ECS
            let splittedBaseUrl = baseUrl.split("/");
            if (route.startsWith(splittedBaseUrl.pop()))
                baseUrl = splittedBaseUrl.join("/");
            route = baseUrl + "/" + route;
        }
        return params ? new route_info_1.RouteInfo(route).generateUrl(params) : route.replaceAll(" ", "");
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map