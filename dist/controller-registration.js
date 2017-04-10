"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var n_defensive_1 = require("n-defensive");
var n_exception_1 = require("n-exception");
var http_method_1 = require("./http-method");
var http_route_1 = require("./http-route");
var route_1 = require("./route");
var ControllerRegistration = (function () {
    function ControllerRegistration(controller) {
        n_defensive_1.given(controller, "controller").ensureHasValue();
        this._name = controller.getTypeName();
        this._controller = controller;
        if (!Reflect.hasOwnMetadata(http_method_1.httpMethodSymbol, this._controller))
            throw new n_exception_1.ApplicationException("Controller '{0}' does not have http method applied."
                .format(this._name));
        if (!Reflect.hasOwnMetadata(http_route_1.httpRouteSymbol, this._controller))
            throw new n_exception_1.ApplicationException("Controller '{0}' does not have http route applied."
                .format(this._name));
        this._method = Reflect.getOwnMetadata(http_method_1.httpMethodSymbol, this._controller);
        this._route = new route_1.Route(Reflect.getOwnMetadata(http_route_1.httpRouteSymbol, this._controller));
    }
    Object.defineProperty(ControllerRegistration.prototype, "name", {
        get: function () { return this._name; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ControllerRegistration.prototype, "controller", {
        get: function () { return this._controller; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ControllerRegistration.prototype, "method", {
        get: function () { return this._method; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ControllerRegistration.prototype, "route", {
        get: function () { return this._route; },
        enumerable: true,
        configurable: true
    });
    return ControllerRegistration;
}());
exports.ControllerRegistration = ControllerRegistration;
//# sourceMappingURL=controller-registration.js.map