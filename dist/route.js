"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var n_defensive_1 = require("n-defensive");
require("n-ext");
var n_exception_1 = require("n-exception");
var route_param_1 = require("./route-param");
// route format: /api/Product/{id:number}?{name?:string}&{all:boolean}
var Route = (function () {
    function Route(routeTemplate) {
        this._routeParams = new Array();
        this._routeParamsRegistry = {};
        n_defensive_1.given(routeTemplate, "routeTemplate").ensureHasValue().ensure(function (t) { return !t.isEmptyOrWhiteSpace(); });
        routeTemplate = routeTemplate.trim();
        while (routeTemplate.contains(" "))
            routeTemplate = routeTemplate.replace(" ", "");
        this._routeTemplate = routeTemplate;
        this.populateRouteParams();
        this._koaRoute = this.generateKoaRoute(this._routeTemplate);
    }
    Object.defineProperty(Route.prototype, "route", {
        get: function () { return this._routeTemplate; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Route.prototype, "koaRoute", {
        get: function () { return this._koaRoute; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Route.prototype, "params", {
        get: function () { return this._routeParams; },
        enumerable: true,
        configurable: true
    });
    Route.prototype.findRouteParam = function (key) {
        n_defensive_1.given(key, "key").ensureHasValue().ensure(function (t) { return !t.isEmptyOrWhiteSpace(); });
        return this._routeParamsRegistry[key.trim().toLowerCase()];
    };
    Route.prototype.generateUrl = function (values) {
        var url = this._routeTemplate;
        for (var key in values) {
            var routeParam = this.findRouteParam(key);
            if (!routeParam)
                continue;
            var param = "{" + routeParam.param + "}";
            var replacement = routeParam.isQuery ? "{0}={1}".format(key, values[key]) : values[key];
            url = url.replace(param, replacement);
        }
        return url;
    };
    Route.prototype.populateRouteParams = function () {
        var index = 1;
        for (var _i = 0, _a = this.extractTemplateParams(this._routeTemplate).map(function (t) { return new route_param_1.RouteParam(t); }); _i < _a.length; _i++) {
            var routeParam = _a[_i];
            var key = routeParam.paramKey.toLowerCase();
            if (this._routeParamsRegistry[key])
                throw new n_exception_1.ApplicationException("Invalid route template. Duplicate route params (case insensitive) detected.");
            routeParam.setOrder(index++);
            this._routeParamsRegistry[key] = routeParam;
            this._routeParams.push(routeParam);
        }
    };
    Route.prototype.extractTemplateParams = function (routeTemplate) {
        var templateParams = new Array();
        var queryFound = false;
        var startFound = false;
        var startIndex = 0;
        for (var i = 0; i < routeTemplate.length; i++) {
            if (routeTemplate[i] === "?" && !startFound) {
                if (queryFound)
                    throw new n_exception_1.ApplicationException("Invalid route template. Unresolvable '?' characters detected.");
                queryFound = true;
            }
            if (routeTemplate[i] === "{") {
                if (startFound)
                    throw new n_exception_1.ApplicationException("Invalid route template. Braces do not match.");
                startFound = true;
                startIndex = i + 1;
            }
            else if (routeTemplate[i] === "}") {
                if (!startFound)
                    throw new n_exception_1.ApplicationException("Invalid route template. Braces do not match.");
                var value = routeTemplate.substring(startIndex, i);
                value = value.trim();
                if (queryFound)
                    value = value + "[Q]";
                templateParams.push(value);
                startFound = false;
            }
        }
        return templateParams;
    };
    Route.prototype.generateKoaRoute = function (routeTemplate) {
        for (var _i = 0, _a = this._routeParams; _i < _a.length; _i++) {
            var routeParam = _a[_i];
            var asItWas = "{" + routeParam.param + "}";
            if (!routeTemplate.contains(asItWas))
                throw new n_exception_1.ApplicationException("Invalid route template.");
            routeTemplate = routeTemplate.replace(asItWas, ":{0}".format(routeParam.paramKey));
        }
        if (routeTemplate.contains("?")) {
            var splitted = routeTemplate.split("?");
            if (splitted.length > 2)
                throw new n_exception_1.ApplicationException("Invalid route template. Unresolvable '?' characters detected.");
            routeTemplate = splitted[0];
        }
        return routeTemplate;
    };
    return Route;
}());
exports.Route = Route;
//# sourceMappingURL=route.js.map