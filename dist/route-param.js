"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var n_defensive_1 = require("n-defensive");
require("n-ext");
var n_exception_1 = require("n-exception");
var param_parse_exception_1 = require("./param-parse-exception");
var RouteParam = (function () {
    function RouteParam(routeParam) {
        this._order = 0;
        n_defensive_1.given(routeParam, "routeParam").ensureHasValue().ensure(function (t) { return !t.isEmptyOrWhiteSpace(); });
        var param = routeParam.trim();
        var paramKey;
        var paramType;
        var isQuery = false;
        var isOptional = false;
        if (param.endsWith("[Q]")) {
            isQuery = true;
            param = param.replace("[Q]", "");
        }
        if (param.contains(":")) {
            var splitted = param.split(":");
            if (splitted.length > 2 || splitted[0].isEmptyOrWhiteSpace() || splitted[1].isEmptyOrWhiteSpace())
                throw new n_exception_1.InvalidArgumentException("routeParam");
            paramKey = splitted[0].trim();
            paramType = splitted[1].trim().toLowerCase();
            if (paramType !== ParamTypes.boolean && paramType !== ParamTypes.number && paramType !== ParamTypes.string)
                paramType = ParamTypes.any;
        }
        else {
            paramKey = param;
            paramType = ParamTypes.any;
        }
        if (paramKey.endsWith("?")) {
            if (!isQuery)
                throw new n_exception_1.ApplicationException("Path parameters cannot be optional.");
            paramKey = paramKey.substr(0, paramKey.length - 1);
            isOptional = true;
        }
        this._param = param;
        this._paramKey = paramKey;
        this._paramType = paramType;
        this._isQuery = isQuery;
        this._isOptional = isOptional;
    }
    Object.defineProperty(RouteParam.prototype, "param", {
        get: function () { return this._param; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RouteParam.prototype, "paramKey", {
        get: function () { return this._paramKey; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RouteParam.prototype, "paramType", {
        get: function () { return this._paramType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RouteParam.prototype, "isQuery", {
        get: function () { return this._isQuery; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RouteParam.prototype, "isOptional", {
        get: function () { return this._isOptional; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RouteParam.prototype, "order", {
        get: function () { return this._order; },
        enumerable: true,
        configurable: true
    });
    RouteParam.prototype.setOrder = function (order) {
        n_defensive_1.given(order, "order").ensureHasValue();
        if (this._order > 0)
            throw new n_exception_1.InvalidOperationException("setOrder");
        this._order = order;
    };
    RouteParam.prototype.parseParam = function (value) {
        if (value === undefined || value == null || value.isEmptyOrWhiteSpace()) {
            if (this._isOptional)
                return null;
            throw new param_parse_exception_1.ParamParseException("Param is not optional.");
        }
        value = value.trim();
        if (this._paramType === ParamTypes.string || this._paramType === ParamTypes.any)
            return value;
        try {
            return this._paramType === ParamTypes.number ? this.parseNumber(value) : this.parseBoolean(value);
        }
        catch (error) {
            var exp = error;
            if (this._isOptional && exp.name === param_parse_exception_1.ParamParseException.getTypeName())
                return null;
            throw error;
        }
    };
    RouteParam.prototype.parseNumber = function (value) {
        try {
            var num = value.contains(".") ? Number.parseFloat(value) : Number.parseInt(value);
            if (!Number.isNaN(num))
                return num;
            throw "PARSE ERROR";
        }
        catch (error) {
            throw new param_parse_exception_1.ParamParseException("Unable to parse number.");
        }
    };
    RouteParam.prototype.parseBoolean = function (value) {
        value = value.toLowerCase();
        if (value === "true")
            return true;
        if (value === "false")
            return false;
        throw new param_parse_exception_1.ParamParseException("Unable to parse boolean.");
    };
    return RouteParam;
}());
exports.RouteParam = RouteParam;
var ParamTypes = (function () {
    function ParamTypes() {
    }
    Object.defineProperty(ParamTypes, "boolean", {
        get: function () { return this._boolean; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ParamTypes, "number", {
        get: function () { return this._number; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ParamTypes, "string", {
        get: function () { return this._string; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ParamTypes, "any", {
        get: function () { return this._any; },
        enumerable: true,
        configurable: true
    });
    return ParamTypes;
}());
ParamTypes._boolean = "boolean";
ParamTypes._number = "number";
ParamTypes._string = "string";
ParamTypes._any = "any";
//# sourceMappingURL=route-param.js.map