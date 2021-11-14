"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpDelete = exports.httpPut = exports.httpPost = exports.httpGet = exports.httpMethodSymbol = exports.HttpMethods = void 0;
require("reflect-metadata");
class HttpMethods {
    static get Get() { return this._get; }
    static get Post() { return this._post; }
    static get Put() { return this._put; }
    static get Delete() { return this._delete; }
}
exports.HttpMethods = HttpMethods;
HttpMethods._get = "GET";
HttpMethods._post = "POST";
HttpMethods._put = "PUT";
HttpMethods._delete = "DELETE";
exports.httpMethodSymbol = Symbol("httpMethod");
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