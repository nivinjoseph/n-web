"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
exports.authorizeSymbol = Symbol("authorize");
// public
function authorize(...claims) {
    return (target) => Reflect.defineMetadata(exports.authorizeSymbol, claims, target);
}
exports.authorize = authorize;
//# sourceMappingURL=authorize.js.map