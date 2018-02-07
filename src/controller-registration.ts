import "reflect-metadata";
import { given } from "n-defensive";
import { ApplicationException, ArgumentException } from "n-exception";
import { httpMethodSymbol, HttpMethods } from "./http-method";
import { httpRouteSymbol } from "./route";
import { RouteInfo } from "./route-info";
import { viewSymbol } from "./view";
import { viewLayoutSymbol } from "./view-layout";
import { authorizeSymbol } from "./security/authorize";
import "n-ext";
import * as fs from "fs";
import * as path from "path";
import { ConfigurationManager } from "n-config";
import { Claim } from "n-sec";


export class ControllerRegistration
{
    private readonly _name: string;
    private readonly _controller: Function;
    private _method: string;
    private _route: RouteInfo;
    private _viewFileName: string = null;
    private _viewFilePath: string = null;
    private _viewFileData: string = null;
    private _viewLayoutFileName: string = null;
    private _viewLayoutFilePath: string = null;
    private _viewLayoutFileData: string = null;
    private _authorizeClaims: ReadonlyArray<Claim> = null;


    public get name(): string { return this._name; }
    public get controller(): Function { return this._controller; }
    public get method(): string { return this._method; }
    public get route(): RouteInfo { return this._route; }
    public get view(): string { return this.retrieveView(); }
    public get viewLayout(): string { return this.retrieveViewLayout(); }
    public get authorizeClaims(): ReadonlyArray<Claim> { return this._authorizeClaims; }


    public constructor(controller: Function)
    {
        given(controller, "controller").ensureHasValue();

        this._name = (<Object>controller).getTypeName();
        this._controller = controller;
    }
    
    
    public complete(viewResolutionRoot: string): void
    {
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

        if (Reflect.hasOwnMetadata(viewSymbol, this._controller))
        {
            let viewFileName = Reflect.getOwnMetadata(viewSymbol, this._controller);
            if (!viewFileName.endsWith(".html"))
                viewFileName += ".html";    
            let viewFilePath = this.resolvePath(viewResolutionRoot, viewFileName);
            if (viewFilePath === null)
                throw new ArgumentException("viewFile[{0}]".format(viewFileName), "was not found");

            this._viewFileName = viewFileName;
            this._viewFilePath = viewFilePath;
            if (!this.isDev())
                this._viewFileData = fs.readFileSync(this._viewFilePath, "utf8");

            if (Reflect.hasOwnMetadata(viewLayoutSymbol, this._controller))
            {
                let viewLayoutFileName = Reflect.getOwnMetadata(viewLayoutSymbol, this._controller);
                if (!viewLayoutFileName.endsWith(".html"))
                    viewLayoutFileName += ".html";    
                let viewLayoutFilePath = this.resolvePath(viewResolutionRoot, viewLayoutFileName);
                if (viewLayoutFilePath === null)
                    throw new ArgumentException("viewLayoutFile[{0}]".format(viewLayoutFileName), "was not found");

                this._viewLayoutFileName = viewLayoutFileName;
                this._viewLayoutFilePath = viewLayoutFilePath;
                if (!this.isDev())
                    this._viewLayoutFileData = fs.readFileSync(this._viewLayoutFilePath, "utf8");
            }
        }
        
        if (Reflect.hasOwnMetadata(authorizeSymbol, this._controller))
            this._authorizeClaims = Reflect.getOwnMetadata(authorizeSymbol, this._controller);
    }
    
    private resolvePath(startPoint: string, fileName: string): string
    {
        if (startPoint.endsWith(fileName))
            return startPoint;
        
        if (fs.statSync(startPoint).isDirectory())
        {
            let files = fs.readdirSync(startPoint);
            for (let file of files)
            {
                if (file.startsWith(".") || file.startsWith("node_modules"))
                    continue;
                
                let resolvedPath = this.resolvePath(path.join(startPoint, file), fileName);
                if (resolvedPath != null)
                    return resolvedPath;
            }
        }    
        
        return null;
    }
       
    private retrieveView(): string
    {
        if (this._viewFilePath === null)
            return null;
        
        if (this.isDev())
            return fs.readFileSync(this._viewFilePath, "utf8");
        
        return this._viewFileData;
    }
    
    private retrieveViewLayout(): string
    {
        if (this._viewLayoutFilePath === null)
            return null;    
        
        if (this.isDev())
            return fs.readFileSync(this._viewLayoutFilePath, "utf8");

        return this._viewLayoutFileData;
    }
    
    private isDev(): boolean
    {
        let env = ConfigurationManager.getConfig<string>("env");
        return env !== null && env.trim().toLowerCase() === "dev"; 
    }
}