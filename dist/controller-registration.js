"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const n_defensive_1 = require("n-defensive");
const n_exception_1 = require("n-exception");
const http_method_1 = require("./http-method");
const http_route_1 = require("./http-route");
const route_1 = require("./route");
const view_1 = require("./view");
const view_layout_1 = require("./view-layout");
require("n-ext");
const fs = require("fs");
const path = require("path");
class ControllerRegistration {
    constructor(controller) {
        this._view = null;
        this._viewLayout = null;
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
        if (Reflect.hasOwnMetadata(view_1.viewSymbol, this._controller)) {
            let filePath = Reflect.getOwnMetadata(view_1.viewSymbol, this._controller);
            filePath = path.join(process.cwd(), filePath);
            if (!fs.existsSync(filePath))
                throw new n_exception_1.ArgumentException("viewFilePath[{0}]".format(filePath), "does not exist");
            this._view = fs.readFileSync(filePath, "utf8");
            if (Reflect.hasOwnMetadata(view_layout_1.viewLayoutSymbol, this._controller)) {
                let filePath = Reflect.getOwnMetadata(view_layout_1.viewLayoutSymbol, this._controller);
                filePath = path.join(process.cwd(), filePath);
                if (!fs.existsSync(filePath))
                    throw new n_exception_1.ArgumentException("viewLayoutFilePath[{0}]".format(filePath), "does not exist");
                this._viewLayout = fs.readFileSync(filePath, "utf8");
            }
        }
    }
    get name() { return this._name; }
    get controller() { return this._controller; }
    get method() { return this._method; }
    get route() { return this._route; }
    get view() { return this._view; }
    get viewLayout() { return this._viewLayout; }
}
exports.ControllerRegistration = ControllerRegistration;
//# sourceMappingURL=controller-registration.js.map