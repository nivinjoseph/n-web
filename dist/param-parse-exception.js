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
var ParamParseException = (function (_super) {
    __extends(ParamParseException, _super);
    function ParamParseException(message) {
        return _super.call(this, message) || this;
    }
    return ParamParseException;
}(n_exception_1.ApplicationException));
exports.ParamParseException = ParamParseException;
//# sourceMappingURL=param-parse-exception.js.map