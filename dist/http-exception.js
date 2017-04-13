"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var n_exception_1 = require("n-exception");
require("n-ext");
var n_defensive_1 = require("n-defensive");
var HttpException = (function (_super) {
    __extends(HttpException, _super);
    function HttpException(statusCode, body) {
        var _this = this;
        n_defensive_1.given(statusCode, "statusCode").ensureHasValue()
            .ensure(function (t) { return [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410,
            411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451,
            500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511].some(function (u) { return u === t; }); });
        _this = _super.call(this, null) || this;
        _this._statusCode = statusCode;
        _this._body = body;
        return _this;
    }
    Object.defineProperty(HttpException.prototype, "statusCode", {
        get: function () { return this._statusCode; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpException.prototype, "body", {
        get: function () { return this._body; },
        enumerable: true,
        configurable: true
    });
    return HttpException;
}(n_exception_1.Exception));
exports.HttpException = HttpException;
//# sourceMappingURL=http-exception.js.map