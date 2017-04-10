"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var n_defensive_1 = require("n-defensive");
require("n-ext");
exports.httpRouteSymbol = Symbol("route");
// public
function httpRoute(route) {
    n_defensive_1.given(route, "route").ensureHasValue().ensure(function (t) { return !t.isEmptyOrWhiteSpace(); });
    return function (target) { return Reflect.defineMetadata(exports.httpRouteSymbol, route, target); };
}
exports.httpRoute = httpRoute;
//# sourceMappingURL=http-route.js.map