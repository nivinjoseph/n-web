import "reflect-metadata";
import { given } from "n-defensive";
import { ApplicationException, ArgumentException } from "n-exception";
import { httpMethodSymbol, HttpMethods } from "./http-method";
import { httpRouteSymbol } from "./route";
import { RouteInfo } from "./route-info";
import { viewSymbol } from "./view";
import { viewLayoutSymbol } from "./view-layout";
import "n-ext";
import * as fs from "fs";
import * as path from "path";
import { ConfigurationManager } from "n-config";


export class ControllerRegistration
{
    private readonly _name: string;
    private readonly _controller: Function;
    private readonly _method: string;
    private readonly _route: RouteInfo;
    private readonly _viewFileName: string = null;
    private readonly _viewFilePath: string = null;
    private readonly _viewFileData: string = null;
    private readonly _viewLayoutFileName: string = null;
    private readonly _viewLayoutFilePath: string = null;
    private readonly _viewLayoutFileData: string = null;


    public get name(): string { return this._name; }
    public get controller(): Function { return this._controller; }
    public get method(): string { return this._method; }
    public get route(): RouteInfo { return this._route; }
    public get view(): string { return this.retrieveView(); }
    public get viewLayout(): string { return this.retrieveViewLayout(); }


    public constructor(controller: Function)
    {
        given(controller, "controller").ensureHasValue();

        this._name = (<Object>controller).getTypeName();
        this._controller = controller;

        if (!Reflect.hasOwnMetadata(httpMethodSymbol, this._controller))
            throw new ApplicationException("Controller '{0}' does not have http method applied."
                .format(this._name));

        if (!Reflect.hasOwnMetadata(httpRouteSymbol, this._controller))
            throw new ApplicationException("Controller '{0}' does not have http route applied."
                .format(this._name));

        this._method = Reflect.getOwnMetadata(httpMethodSymbol, this._controller);
        this._route = new RouteInfo(Reflect.getOwnMetadata(httpRouteSymbol, this._controller));
        
        if (Reflect.hasOwnMetadata(viewSymbol, this._controller))
        {
            let viewFileName = Reflect.getOwnMetadata(viewSymbol, this._controller);
            let viewFilePath = this.resolvePath(process.cwd(), viewFileName);
            if (viewFilePath === null)
                throw new ArgumentException("viewFile[{0}]".format(viewFileName), "was not found");
            
            this._viewFileName = viewFileName;
            this._viewFilePath = viewFilePath;
            if (!this.isDev())
                this._viewFileData = fs.readFileSync(this._viewFilePath, "utf8");
            
            if (Reflect.hasOwnMetadata(viewLayoutSymbol, this._controller))
            {
                let viewLayoutFileName = Reflect.getOwnMetadata(viewLayoutSymbol, this._controller);
                let viewLayoutFilePath = this.resolvePath(process.cwd(), viewLayoutFileName);
                if (viewLayoutFilePath === null)
                    throw new ArgumentException("viewLayoutFile[{0}]".format(viewLayoutFileName), "was not found");
                
                this._viewLayoutFileName = viewLayoutFileName;
                this._viewLayoutFilePath = viewLayoutFilePath;
                if (!this.isDev())
                    this._viewLayoutFileData = fs.readFileSync(this._viewLayoutFilePath, "utf8");
            }
        }    
    }
    
    private resolvePath(startPoint: string, fileName: string): string
    {
        if (startPoint.endsWith(fileName))
            return startPoint;
        
        if (!fs.statSync(startPoint).isDirectory())
            return null;
        
        let files = fs.readdirSync(startPoint);
        for (let file of files)
        {
            startPoint = path.join(startPoint, file);
            let resolvedPath = this.resolvePath(startPoint, fileName);
            if (resolvedPath != null)
                return resolvedPath;    
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
        let mode = ConfigurationManager.getConfig<string>("mode");
        return mode !== null && mode.trim().toLowerCase() === "dev"; 
    }
}