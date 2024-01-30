"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = exports.httpRouteSymbol = void 0;
require("reflect-metadata");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
exports.httpRouteSymbol = Symbol.for("@nivinjoseph/n-web/httpRoute");
// public
function route(route) {
    (0, n_defensive_1.given)(route, "route").ensureHasValue().ensureIsString()
        .ensure(t => t.trim().startsWith("/"), "has to begin with '/'");
    return (target) => Reflect.defineMetadata(exports.httpRouteSymbol, route.trim(), target);
}
exports.route = route;
//# sourceMappingURL=route.js.map