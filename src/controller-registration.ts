import "reflect-metadata";
import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException, ArgumentException } from "@nivinjoseph/n-exception";
import { httpMethodSymbol, HttpMethods } from "./http-method";
import { httpRouteSymbol } from "./route";
import { RouteInfo } from "./route-info";
import { viewSymbol } from "./view";
import { viewLayoutSymbol } from "./view-layout";
import { authorizeSymbol } from "./security/authorize";
import "@nivinjoseph/n-ext";
import * as fs from "fs";
import * as path from "path";
import { ConfigurationManager } from "@nivinjoseph/n-config";
import { Claim } from "@nivinjoseph/n-sec";


export class ControllerRegistration
{
    private readonly _name: string;
    private readonly _controller: Function;
    private _method!: string;
    private _route!: RouteInfo;
    private _viewFileName: string | null = null;
    private _viewFilePath: string | null = null;
    private _viewFileData: string | null = null;
    private _viewLayoutFileName: string | null = null;
    private _viewLayoutFilePath: string | null = null;
    private _viewLayoutFileData: string | null = null;
    private _authorizeClaims: ReadonlyArray<Claim> | null = null;


    public get name(): string { return this._name; }
    public get controller(): Function { return this._controller; }
    public get method(): string { return this._method; }
    public get route(): RouteInfo { return this._route; }
    public get view(): string | null { return this._retrieveView(); }
    public get viewLayout(): string | null { return this._retrieveViewLayout(); }
    public get authorizeClaims(): ReadonlyArray<Claim> | null { return this._authorizeClaims; }


    public constructor(controller: Function)
    {
        given(controller, "controller").ensureHasValue().ensureIsFunction();

        this._name = (<Object>controller).getTypeName();
        this._controller = controller;
    }
    
    
    public complete(viewResolutionRoot?: string): void
    {
        given(viewResolutionRoot as string, "viewResolutionRoot").ensureIsString();
        viewResolutionRoot = viewResolutionRoot ? path.join(process.cwd(), viewResolutionRoot) : process.cwd();
        
        if (!Reflect.hasOwnMetadata(httpMethodSymbol, this._controller))
            throw new ApplicationException("Controller '{0}' does not have http method applied."
                .format(this._name));

        if (!Reflect.hasOwnMetadata(httpRouteSymbol, this._controller))
            throw new ApplicationException("Controller '{0}' does not have http route applied."
                .format(this._name));

        this._method = Reflect.getOwnMetadata(httpMethodSymbol, this._controller);
        this._route = new RouteInfo(Reflect.getOwnMetadata(httpRouteSymbol, this._controller));
        
        if (this._route.isCatchAll && this._method !== HttpMethods.Get)
            throw new ApplicationException("Controller '{0}' has a catch all route but is not using HTTP GET."
                .format(this._name));

        this._configureViews(viewResolutionRoot);
        
        if (Reflect.hasOwnMetadata(authorizeSymbol, this._controller))
            this._authorizeClaims = Reflect.getOwnMetadata(authorizeSymbol, this._controller);
    }
    
    private _configureViews(viewResolutionRoot: string): void
    {
        if (Reflect.hasOwnMetadata(viewSymbol, this._controller))
        {
            let viewFileName: string = Reflect.getOwnMetadata(viewSymbol, this._controller);
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

            
            if (Reflect.hasOwnMetadata(viewLayoutSymbol, this._controller))
            {
                let viewLayoutFileName: string = Reflect.getOwnMetadata(viewLayoutSymbol, this._controller);
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
       
    private _retrieveView(): string | null
    {
        if (this._viewFilePath == null)
            return null;
        
        if (this._isDev())
        {
            const HmrHelper = require("./hmr-helper").HmrHelper;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return HmrHelper.isConfigured
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                ? HmrHelper.devFs.readFileSync(path.resolve(HmrHelper.outputPath, this._viewFileName!), "utf8")
                : fs.readFileSync(this._viewFilePath, "utf8");
        }
        
        return this._viewFileData;
    }
    
    private _retrieveViewLayout(): string | null
    {
        if (this._viewLayoutFilePath == null)
            return null;    
        
        if (this._isDev())
        {
            const HmrHelper = require("./hmr-helper").HmrHelper;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return HmrHelper.isConfigured
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                ? HmrHelper.devFs.readFileSync(path.resolve(HmrHelper.outputPath, this._viewLayoutFileName!), "utf8")
                : fs.readFileSync(this._viewLayoutFilePath, "utf8");
        }

        return this._viewLayoutFileData;
    }
    
    private _isDev(): boolean
    {
        const env = ConfigurationManager.getConfig<string | null>("env");
        return env === "dev"; 
    }
}