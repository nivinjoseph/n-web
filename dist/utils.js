"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const route_info_1 = require("./route-info");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
// public
class Utils // static class
 {
    static generateUrl(route, params, baseUrl) {
        var _a;
        (0, n_defensive_1.given)(route, "route").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        if (params)
            (0, n_defensive_1.given)(params, "params").ensureIsObject();
        if (baseUrl)
            (0, n_defensive_1.given)(baseUrl, "baseUrl").ensureIsString();
        route = route.trim().replaceAll(" ", "");
        if (baseUrl != null && baseUrl.isNotEmptyOrWhiteSpace()) {
            baseUrl = baseUrl.trim().replaceAll(" ", "");
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            if (route.startsWith("/"))
                route = route.substr(1, route.length - 1);
            // special treatment for the sake of docker routing on ECS
            const splittedBaseUrl = baseUrl.split("/");
            const popped = (_a = splittedBaseUrl.pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            if (popped != null && route.toLowerCase().startsWith(popped))
                baseUrl = splittedBaseUrl.join("/");
            route = baseUrl + "/" + route;
        }
        return params ? new route_info_1.RouteInfo(route, true).generateUrl(params) : route;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map