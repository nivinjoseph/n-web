import { ConfigurationManager } from "@nivinjoseph/n-config";
import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException, ArgumentException } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";
import { Claim } from "@nivinjoseph/n-sec";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { HttpMethods, httpMethodSymbol } from "./http-method.js";
import { RouteInfo } from "./route-info.js";
import { httpRouteSymbol } from "./route.js";
import { authorizeSymbol } from "./security/authorize.js";
import { viewLayoutSymbol } from "./view-layout.js";
import { viewSymbol } from "./view.js";
export class ControllerRegistration {
    _name;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    _controller;
    _method;
    _route;
    // @ts-expect-error not used atm
    _viewFileName = null;
    _viewFilePath = null;
    _viewFileData = null;
    // @ts-expect-error not used atm
    _viewLayoutFileName = null;
    _viewLayoutFilePath = null;
    _viewLayoutFileData = null;
    _authorizeClaims = null;
    get name() { return this._name; }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    get controller() { return this._controller; }
    get method() { return this._method; }
    get route() { return this._route; }
    get hasView() { return this._viewFilePath != null; }
    get hasViewLayout() { return this._viewLayoutFilePath != null; }
    get authorizeClaims() { return this._authorizeClaims; }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    constructor(controller) {
        given(controller, "controller").ensureHasValue().ensureIsFunction();
        this._name = controller.getTypeName();
        this._controller = controller;
    }
    complete(viewResolutionRoot) {
        given(viewResolutionRoot, "viewResolutionRoot").ensureIsString();
        viewResolutionRoot = viewResolutionRoot ? path.join(process.cwd(), viewResolutionRoot) : process.cwd();
        const metadata = this._controller[Symbol.metadata];
        if (metadata == null) // if metadata object is null/undefined that means there were no decorators applied
            throw new ApplicationException(`Controller '${this._name}' does not have http method applied.`);
        const httpMethod = metadata[httpMethodSymbol];
        if (httpMethod == null)
            throw new ApplicationException(`Controller '${this._name}' does not have http method applied.`);
        const httpRoute = metadata[httpRouteSymbol];
        if (httpRoute == null)
            throw new ApplicationException(`Controller '${this._name}' does not have http route applied.`);
        this._method = httpMethod;
        this._route = new RouteInfo(httpRoute);
        if (this._route.isCatchAll && this._method !== HttpMethods.Get)
            throw new ApplicationException(`Controller '${this._name}' has a catch all route but is not using HTTP GET.`);
        this._configureViews(viewResolutionRoot);
        const claims = metadata[authorizeSymbol];
        if (claims != null)
            this._authorizeClaims = claims;
    }
    async retrieveView() {
        if (!this.hasView)
            return null;
        if (this._isDev()) {
            // const HmrHelper = (await import("./hmr-helper.js")).HmrHelper;// require("./hmr-helper").HmrHelper;
            // return HmrHelper.isConfigured
            //     ? HmrHelper.devFs.readFileSync(path.resolve(HmrHelper.outputPath, this._viewFileName!), "utf8").toString()
            return readFileSync(this._viewFilePath, "utf8");
        }
        return this._viewFileData;
    }
    async retrieveViewLayout() {
        if (!this.hasViewLayout)
            return null;
        if (this._isDev()) {
            // const HmrHelper = require("./hmr-helper.js").HmrHelper;
            // return HmrHelper.isConfigured
            //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            //     ? HmrHelper.devFs.readFileSync(path.resolve(HmrHelper.outputPath, this._viewLayoutFileName!), "utf8")
            //     : fs.readFileSync(this._viewLayoutFilePath!, "utf8");
            return readFileSync(this._viewLayoutFilePath, "utf8");
        }
        return this._viewLayoutFileData;
    }
    _configureViews(viewResolutionRoot) {
        const view = this._controller[Symbol.metadata][viewSymbol];
        if (view != null) {
            let viewFileName = view;
            if (!viewFileName.endsWith(".html"))
                viewFileName += ".html";
            if (viewFileName.startsWith("~/")) {
                this._viewFilePath = path.join(process.cwd(), viewFileName.replace("~/", ""));
                this._viewFileName = path.basename(this._viewFilePath);
            }
            else {
                const viewFilePath = this._resolvePath(viewResolutionRoot, viewFileName);
                if (viewFilePath === null)
                    throw new ArgumentException("viewFile[{0}]".format(viewFileName), "was not found");
                this._viewFileName = viewFileName;
                this._viewFilePath = viewFilePath;
            }
            if (!this._isDev())
                this._viewFileData = readFileSync(this._viewFilePath, "utf8");
            const viewLayout = this._controller[Symbol.metadata][viewLayoutSymbol];
            if (viewLayout != null) {
                let viewLayoutFileName = viewLayout;
                if (!viewLayoutFileName.endsWith(".html"))
                    viewLayoutFileName += ".html";
                if (viewLayoutFileName.startsWith("~/")) {
                    this._viewLayoutFilePath = path.join(process.cwd(), viewLayoutFileName.replace("~/", ""));
                    this._viewLayoutFileName = path.basename(this._viewLayoutFilePath);
                }
                else {
                    const viewLayoutFilePath = this._resolvePath(viewResolutionRoot, viewLayoutFileName);
                    if (viewLayoutFilePath === null)
                        throw new ArgumentException("viewLayoutFile[{0}]".format(viewLayoutFileName), "was not found");
                    this._viewLayoutFileName = viewLayoutFileName;
                    this._viewLayoutFilePath = viewLayoutFilePath;
                }
                if (!this._isDev())
                    this._viewLayoutFileData = readFileSync(this._viewLayoutFilePath, "utf8");
            }
        }
    }
    _resolvePath(startPoint, fileName) {
        if (startPoint.endsWith(fileName))
            return startPoint;
        if (statSync(startPoint).isDirectory()) {
            const files = readdirSync(startPoint);
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
    _isDev() {
        const env = ConfigurationManager.getConfig("env");
        return env === "dev";
    }
}
//# sourceMappingURL=controller-registration.js.map