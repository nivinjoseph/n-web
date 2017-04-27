"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_method_1 = require("./http-method");
// public
function query(target) {
    Reflect.defineMetadata(http_method_1.httpMethodSymbol, http_method_1.HttpMethods.Get, target);
}
exports.query = query;
//# sourceMappingURL=query.js.map