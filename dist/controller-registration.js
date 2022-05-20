"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerRegistration = void 0;
require("reflect-metadata");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const n_exception_1 = require("@nivinjoseph/n-exception");
const http_method_1 = require("./http-method");
const route_1 = require("./route");
const route_info_1 = require("./route-info");
const view_1 = require("./view");
const view_layout_1 = require("./view-layout");
const authorize_1 = require("./security/authorize");
require("@nivinjoseph/n-ext");
const fs = require("fs");
const path = require("path");
const n_config_1 = require("@nivinjoseph/n-config");
class ControllerRegistration {
    constructor(controller) {
        this._viewFileName = null;
        this._viewFilePath = null;
        this._viewFileData = null;
        this._viewLayoutFileName = null;
        this._viewLayoutFilePath = null;
        this._viewLayoutFileData = null;
        this._authorizeClaims = null;
        (0, n_defensive_1.given)(controller, "controller").ensureHasValue().ensureIsFunction();
        this._name = controller.getTypeName();
        this._controller = controller;
    }
    get name() { return this._name; }
    get controller() { return this._controller; }
    get method() { return this._method; }
    get route() { return this._route; }
    get view() { return this._retrieveView(); }
    get viewLayout() { return this._retrieveViewLayout(); }
    get authorizeClaims() { return this._authorizeClaims; }
    complete(viewResolutionRoot) {
        (0, n_defensive_1.given)(viewResolutionRoot, "viewResolutionRoot").ensureIsString();
        viewResolutionRoot = viewResolutionRoot ? path.join(process.cwd(), viewResolutionRoot) : process.cwd();
        if (!Reflect.hasOwnMetadata(http_method_1.httpMethodSymbol, this._controller))
            throw new n_exception_1.ApplicationException("Controller '{0}' does not have http method applied."
                .format(this._name));
        if (!Reflect.hasOwnMetadata(route_1.httpRouteSymbol, this._controller))
            throw new n_exception_1.ApplicationException("Controller '{0}' does not have http route applied."
                .format(this._name));
        this._method = Reflect.getOwnMetadata(http_method_1.httpMethodSymbol, this._controller);
        this._route = new route_info_1.RouteInfo(Reflect.getOwnMetadata(route_1.httpRouteSymbol, this._controller));
        if (this._route.isCatchAll && this._method !== http_method_1.HttpMethods.Get)
            throw new n_exception_1.ApplicationException("Controller '{0}' has a catch all route but is not using HTTP GET."
                .format(this._name));
        this._configureViews(viewResolutionRoot);
        if (Reflect.hasOwnMetadata(authorize_1.authorizeSymbol, this._controller))
            this._authorizeClaims = Reflect.getOwnMetadata(authorize_1.authorizeSymbol, this._controller);
    }
    _configureViews(viewResolutionRoot) {
        if (Reflect.hasOwnMetadata(view_1.viewSymbol, this._controller)) {
            let viewFileName = Reflect.getOwnMetadata(view_1.viewSymbol, this._controller);
            if (!viewFileName.endsWith(".html"))
                viewFileName += ".html";
            if (viewFileName.startsWith("~/")) {
                this._viewFilePath = path.join(process.cwd(), viewFileName.replace("~/", ""));
                this._viewFileName = path.basename(this._viewFilePath);
            }
            else {
                const viewFilePath = this._resolvePath(viewResolutionRoot, viewFileName);
                if (viewFilePath === null)
                    throw new n_exception_1.ArgumentException("viewFile[{0}]".format(viewFileName), "was not found");
                this._viewFileName = viewFileName;
                this._viewFilePath = viewFilePath;
            }
            if (!this._isDev())
                this._viewFileData = fs.readFileSync(this._viewFilePath, "utf8");
            if (Reflect.hasOwnMetadata(view_layout_1.viewLayoutSymbol, this._controller)) {
                let viewLayoutFileName = Reflect.getOwnMetadata(view_layout_1.viewLayoutSymbol, this._controller);
                if (!viewLayoutFileName.endsWith(".html"))
                    viewLayoutFileName += ".html";
                if (viewLayoutFileName.startsWith("~/")) {
                    this._viewLayoutFilePath = path.join(process.cwd(), viewLayoutFileName.replace("~/", ""));
                    this._viewLayoutFileName = path.basename(this._viewLayoutFilePath);
                }
                else {
                    const viewLayoutFilePath = this._resolvePath(viewResolutionRoot, viewLayoutFileName);
                    if (viewLayoutFilePath === null)
                        throw new n_exception_1.ArgumentException("viewLayoutFile[{0}]".format(viewLayoutFileName), "was not found");
                    this._viewLayoutFileName = viewLayoutFileName;
                    this._viewLayoutFilePath = viewLayoutFilePath;
                }
                if (!this._isDev())
                    this._viewLayoutFileData = fs.readFileSync(this._viewLayoutFilePath, "utf8");
            }
        }
    }
    _resolvePath(startPoint, fileName) {
        if (startPoint.endsWith(fileName))
            return startPoint;
        if (fs.statSync(startPoint).isDirectory()) {
            const files = fs.readdirSync(startPoint);
            for (const file of files) {
                if (file.startsWith(".") || file.startsWith("node_modules"))
                    continue;
                const resolvedPath = this._resolvePath(path.join(startPoint, file), fileName);
                if (resolvedPath != null)
                    return resolvedPath;
            }
        }
        return null;
    }
    _retrieveView() {
        if (this._viewFilePath == null)
            return null;
        if (this._isDev()) {
            const HmrHelper = require("./hmr-helper").HmrHelper;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return HmrHelper.isConfigured
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                ? HmrHelper.devFs.readFileSync(path.resolve(HmrHelper.outputPath, this._viewFileName), "utf8")
                : fs.readFileSync(this._viewFilePath, "utf8");
        }
        return this._viewFileData;
    }
    _retrieveViewLayout() {
        if (this._viewLayoutFilePath == null)
            return null;
        if (this._isDev()) {
            const HmrHelper = require("./hmr-helper").HmrHelper;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return HmrHelper.isConfigured
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                ? HmrHelper.devFs.readFileSync(path.resolve(HmrHelper.outputPath, this._viewLayoutFileName), "utf8")
                : fs.readFileSync(this._viewLayoutFilePath, "utf8");
        }
        return this._viewLayoutFileData;
    }
    _isDev() {
        const env = n_config_1.ConfigurationManager.getConfig("env");
        return env !== null && env.trim().toLowerCase() === "dev";
    }
}
exports.ControllerRegistration = ControllerRegistration;
//# sourceMappingURL=controller-registration.js.map