import { ConfigurationManager } from "@nivinjoseph/n-config";
import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException, ArgumentException } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";
import { Claim } from "@nivinjoseph/n-sec";
import fs from "node:fs";
import path from "node:path";
import { HttpMethods, httpMethodSymbol } from "./http-method.js";
import { RouteInfo } from "./route-info.js";
import { httpRouteSymbol } from "./route.js";
import { authorizeSymbol } from "./security/authorize.js";
import { viewLayoutSymbol } from "./view-layout.js";
import { viewSymbol } from "./view.js";

export class ControllerRegistration
{
    private readonly _name: string;
    private readonly _controller: Function;
    private _method!: string;
    private _route!: RouteInfo;
    // @ts-expect-error not used atm
    private _viewFileName: string | null = null;
    private _viewFilePath: string | null = null;
    private _viewFileData: string | null = null;
    // @ts-expect-error not used atm
    private _viewLayoutFileName: string | null = null;
    private _viewLayoutFilePath: string | null = null;
    private _viewLayoutFileData: string | null = null;
    private _authorizeClaims: ReadonlyArray<Claim> | null = null;


    public get name(): string { return this._name; }
    public get controller(): Function { return this._controller; }
    public get method(): string { return this._method; }
    public get route(): RouteInfo { return this._route; }
    public get hasView(): boolean { return this._viewFilePath != null; }
    public get hasViewLayout(): boolean { return this._viewLayoutFilePath != null; }
    // public get view(): string | null { return this._retrieveView(); }
    // public get viewLayout(): string | null { return this._retrieveViewLayout(); }
    public get authorizeClaims(): ReadonlyArray<Claim> | null { return this._authorizeClaims; }


    public constructor(controller: Function)
    {
        given(controller, "controller").ensureHasValue().ensureIsFunction();

        this._name = (<Object>controller).getTypeName();
        this._controller = controller;
    }


    public complete(viewResolutionRoot?: string): void
    {
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

        this._method = httpMethod as string;
        this._route = new RouteInfo(httpRoute as string);

        if (this._route.isCatchAll && this._method !== HttpMethods.Get)
            throw new ApplicationException(`Controller '${this._name}' has a catch all route but is not using HTTP GET.`);

        this._configureViews(viewResolutionRoot);

        const claims = metadata[authorizeSymbol];
        if (claims != null)
            this._authorizeClaims = claims as ReadonlyArray<Claim>;
    }

    public async retrieveView(): Promise<string | null>
    {
        if (!this.hasView)
            return null;

        if (this._isDev())
        {
            // const HmrHelper = (await import("./hmr-helper.js")).HmrHelper;// require("./hmr-helper").HmrHelper;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            // return HmrHelper.isConfigured
            //     ? HmrHelper.devFs.readFileSync(path.resolve(HmrHelper.outputPath, this._viewFileName!), "utf8").toString()
            return fs.readFileSync(this._viewFilePath!, "utf8");
        }

        return this._viewFileData;
    }

    public async retrieveViewLayout(): Promise<string | null>
    {
        if (!this.hasViewLayout)
            return null;

        if (this._isDev())
        {
            // const HmrHelper = require("./hmr-helper.js").HmrHelper;
            // // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            // return HmrHelper.isConfigured
            //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            //     ? HmrHelper.devFs.readFileSync(path.resolve(HmrHelper.outputPath, this._viewLayoutFileName!), "utf8")
            //     : fs.readFileSync(this._viewLayoutFilePath!, "utf8");

            return fs.readFileSync(this._viewLayoutFilePath!, "utf8");
        }

        return this._viewLayoutFileData;
    }

    private _configureViews(viewResolutionRoot: string): void
    {
        const view = this._controller[Symbol.metadata]![viewSymbol];

        if (view != null)
        {
            let viewFileName: string = view as string;
            if (!viewFileName.endsWith(".html"))
                viewFileName += ".html";

            if (viewFileName.startsWith("~/"))
            {
                this._viewFilePath = path.join(process.cwd(), viewFileName.replace("~/", ""));
                this._viewFileName = path.basename(this._viewFilePath);
            }
            else
            {
                const viewFilePath = this._resolvePath(viewResolutionRoot, viewFileName);
                if (viewFilePath === null)
                    throw new ArgumentException("viewFile[{0}]".format(viewFileName), "was not found");

                this._viewFileName = viewFileName;
                this._viewFilePath = viewFilePath;
            }

            if (!this._isDev())
                this._viewFileData = fs.readFileSync(this._viewFilePath, "utf8");


            const viewLayout = this._controller[Symbol.metadata]![viewLayoutSymbol];

            if (viewLayout != null)
            {
                let viewLayoutFileName = viewLayout as string;
                if (!viewLayoutFileName.endsWith(".html"))
                    viewLayoutFileName += ".html";

                if (viewLayoutFileName.startsWith("~/"))
                {
                    this._viewLayoutFilePath = path.join(process.cwd(), viewLayoutFileName.replace("~/", ""));
                    this._viewLayoutFileName = path.basename(this._viewLayoutFilePath);
                }
                else
                {
                    const viewLayoutFilePath = this._resolvePath(viewResolutionRoot, viewLayoutFileName);
                    if (viewLayoutFilePath === null)
                        throw new ArgumentException("viewLayoutFile[{0}]".format(viewLayoutFileName), "was not found");

                    this._viewLayoutFileName = viewLayoutFileName;
                    this._viewLayoutFilePath = viewLayoutFilePath;
                }

                if (!this._isDev())
                    this._viewLayoutFileData = fs.readFileSync(this._viewLayoutFilePath, "utf8");
            }
        }
    }

    private _resolvePath(startPoint: string, fileName: string): string | null
    {
        if (startPoint.endsWith(fileName))
            return startPoint;

        if (fs.statSync(startPoint).isDirectory())
        {
            const files = fs.readdirSync(startPoint);
            for (const file of files)
            {
                if (file.startsWith(".") || file.startsWith("node_modules"))
                    continue;

                const resolvedPath = this._resolvePath(path.join(startPoint, file), fileName);
                if (resolvedPath != null)
                    return resolvedPath;
            }
        }
        return null;
    }


    private _isDev(): boolean
    {
        const env = ConfigurationManager.getConfig<string | null>("env");
        return env === "dev";
    }
}