"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("n-ext");
var n_defensive_1 = require("n-defensive");
var route_1 = require("./route");
// public
var Controller = (function () {
    function Controller() {
    }
    Controller.prototype.generateUrl = function (route, params, baseUrl) {
        n_defensive_1.given(route, "route").ensureHasValue().ensure(function (t) { return !t.isEmptyOrWhiteSpace(); });
        route = route.trim();
        if (baseUrl !== undefined && baseUrl != null) {
            baseUrl = baseUrl.trim();
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            route = baseUrl + route;
        }
        if (params == null)
            return route;
        return new route_1.Route(route).generateUrl(params);
    };
    return Controller;
}());
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map