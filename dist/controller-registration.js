"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const n_defensive_1 = require("n-defensive");
const n_exception_1 = require("n-exception");
const http_method_1 = require("./http-method");
const route_1 = require("./route");
const route_info_1 = require("./route-info");
const view_1 = require("./view");
const view_layout_1 = require("./view-layout");
require("n-ext");
const fs = require("fs");
const path = require("path");
const n_config_1 = require("n-config");
class ControllerRegistration {
    constructor(controller) {
        this._viewFileName = null;
        this._viewFilePath = null;
        this._viewFileData = null;
        this._viewLayoutFileName = null;
        this._viewLayoutFilePath = null;
        this._viewLayoutFileData = null;
        n_defensive_1.given(controller, "controller").ensureHasValue();
        this._name = controller.getTypeName();
        this._controller = controller;
    }
    get name() { return this._name; }
    get controller() { return this._controller; }
    get method() { return this._method; }
    get route() { return this._route; }
    get view() { return this.retrieveView(); }
    get viewLayout() { return this.retrieveViewLayout(); }
    complete(viewResolutionRoot) {
        viewResolutionRoot = viewResolutionRoot ? path.join(process.cwd(), viewResolutionRoot) : process.cwd();
        if (!Reflect.hasOwnMetadata(http_method_1.httpMethodSymbol, this._controller))
            throw new n_exception_1.ApplicationException("Controller '{0}' does not have http method applied."
                .format(this._name));
        if (!Reflect.hasOwnMetadata(route_1.httpRouteSymbol, this._controller))
            throw new n_exception_1.ApplicationException("Controller '{0}' does not have http route applied."
                .format(this._name));
        this._method = Reflect.getOwnMetadata(http_method_1.httpMethodSymbol, this._controller);
        this._route = new route_info_1.RouteInfo(Reflect.getOwnMetadata(route_1.httpRouteSymbol, this._controller));
        if (Reflect.hasOwnMetadata(view_1.viewSymbol, this._controller)) {
            let viewFileName = Reflect.getOwnMetadata(view_1.viewSymbol, this._controller);
            if (!viewFileName.endsWith(".html"))
                viewFileName += ".html";
            let viewFilePath = this.resolvePath(viewResolutionRoot, viewFileName);
            if (viewFilePath === null)
                throw new n_exception_1.ArgumentException("viewFile[{0}]".format(viewFileName), "was not found");
            this._viewFileName = viewFileName;
            this._viewFilePath = viewFilePath;
            if (!this.isDev())
                this._viewFileData = fs.readFileSync(this._viewFilePath, "utf8");
            if (Reflect.hasOwnMetadata(view_layout_1.viewLayoutSymbol, this._controller)) {
                let viewLayoutFileName = Reflect.getOwnMetadata(view_layout_1.viewLayoutSymbol, this._controller);
                if (!viewLayoutFileName.endsWith(".html"))
                    viewLayoutFileName += ".html";
                let viewLayoutFilePath = this.resolvePath(viewResolutionRoot, viewLayoutFileName);
                if (viewLayoutFilePath === null)
                    throw new n_exception_1.ArgumentException("viewLayoutFile[{0}]".format(viewLayoutFileName), "was not found");
                this._viewLayoutFileName = viewLayoutFileName;
                this._viewLayoutFilePath = viewLayoutFilePath;
                if (!this.isDev())
                    this._viewLayoutFileData = fs.readFileSync(this._viewLayoutFilePath, "utf8");
            }
        }
    }
    resolvePath(startPoint, fileName) {
        if (startPoint.endsWith(fileName))
            return startPoint;
        if (fs.statSync(startPoint).isDirectory()) {
            let files = fs.readdirSync(startPoint);
            for (let file of files) {
                if (file.startsWith(".") || file.startsWith("node_modules"))
                    continue;
                let resolvedPath = this.resolvePath(path.join(startPoint, file), fileName);
                if (resolvedPath != null)
                    return resolvedPath;
            }
        }
        return null;
    }
    retrieveView() {
        if (this._viewFilePath === null)
            return null;
        if (this.isDev())
            return fs.readFileSync(this._viewFilePath, "utf8");
        return this._viewFileData;
    }
    retrieveViewLayout() {
        if (this._viewLayoutFilePath === null)
            return null;
        if (this.isDev())
            return fs.readFileSync(this._viewLayoutFilePath, "utf8");
        return this._viewLayoutFileData;
    }
    isDev() {
        let mode = n_config_1.ConfigurationManager.getConfig("mode");
        return mode !== null && mode.trim().toLowerCase() === "dev";
    }
}
exports.ControllerRegistration = ControllerRegistration;
//# sourceMappingURL=controller-registration.js.map