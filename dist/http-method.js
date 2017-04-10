"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var HttpMethods = (function () {
    function HttpMethods() {
    }
    Object.defineProperty(HttpMethods, "Get", {
        get: function () { return this._get; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpMethods, "Post", {
        get: function () { return this._post; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpMethods, "Put", {
        get: function () { return this._put; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpMethods, "Delete", {
        get: function () { return this._delete; },
        enumerable: true,
        configurable: true
    });
    return HttpMethods;
}());
HttpMethods._get = "GET";
HttpMethods._post = "POST";
HttpMethods._put = "PUT";
HttpMethods._delete = "DELETE";
exports.HttpMethods = HttpMethods;
exports.httpMethodSymbol = Symbol("httpmethod");
// public
function httpGet(target) {
    Reflect.defineMetadata(exports.httpMethodSymbol, HttpMethods.Get, target);
}
exports.httpGet = httpGet;
// public
function httpPost(target) {
    Reflect.defineMetadata(exports.httpMethodSymbol, HttpMethods.Post, target);
}
exports.httpPost = httpPost;
// public
function httpPut(target) {
    Reflect.defineMetadata(exports.httpMethodSymbol, HttpMethods.Put, target);
}
exports.httpPut = httpPut;
// public
function httpDelete(target) {
    Reflect.defineMetadata(exports.httpMethodSymbol, HttpMethods.Delete, target);
}
exports.httpDelete = httpDelete;
//# sourceMappingURL=http-method.js.map