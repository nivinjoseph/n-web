"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const n_defensive_1 = require("n-defensive");
require("n-ext");
exports.httpRouteSymbol = Symbol("httpRoute");
// public
function route(route) {
    n_defensive_1.given(route, "route").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
    return (target) => Reflect.defineMetadata(exports.httpRouteSymbol, route.trim(), target);
}
exports.route = route;
//# sourceMappingURL=route.js.map