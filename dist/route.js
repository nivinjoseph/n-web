"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = exports.httpRouteSymbol = void 0;
require("reflect-metadata");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
require("@nivinjoseph/n-ext");
exports.httpRouteSymbol = Symbol("httpRoute");
function route(route) {
    n_defensive_1.given(route, "route").ensureHasValue()
        .ensure(t => !t.isEmptyOrWhiteSpace(), "cannot be empty or whitespace")
        .ensure(t => t.trim().startsWith("/"), "has to begin with '/'");
    return (target) => Reflect.defineMetadata(exports.httpRouteSymbol, route.trim(), target);
}
exports.route = route;
//# sourceMappingURL=route.js.map