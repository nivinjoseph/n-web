"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const http_method_1 = require("./http-method");
function command(target) {
    Reflect.defineMetadata(http_method_1.httpMethodSymbol, http_method_1.HttpMethods.Post, target);
}
exports.command = command;
//# sourceMappingURL=command.js.map