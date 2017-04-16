import "reflect-metadata";
import { given } from "n-defensive";
import { ApplicationException, ArgumentException } from "n-exception";
import { httpMethodSymbol, HttpMethods } from "./http-method";
import { httpRouteSymbol } from "./http-route";
import { Route } from "./route";
import { viewSymbol } from "./view";
import { viewLayoutSymbol } from "./view-layout";
import "n-ext";
import * as fs from "fs";
import * as path from "path";

export class ControllerRegistration
{
    private readonly _name: string;
    private readonly _controller: Function;
    private readonly _method: string;
    private readonly _route: Route;
    private readonly _view: string = null;
    private readonly _viewLayout: string = null;


    public get name(): string { return this._name; }
    public get controller(): Function { return this._controller; }
    public get method(): string { return this._method; }
    public get route(): Route { return this._route; }
    public get view(): string { return this._view; }
    public get viewLayout(): string { return this._viewLayout; }


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
        this._route = new Route(Reflect.getOwnMetadata(httpRouteSymbol, this._controller));
        
        if (Reflect.hasOwnMetadata(viewSymbol, this._controller))
        {
            let filePath = Reflect.getOwnMetadata(viewSymbol, this._controller);
            filePath = path.join(process.cwd(), filePath);
            if (!fs.existsSync(filePath))
                throw new ArgumentException("viewFilePath[{0}]".format(filePath), "does not exist");
            
            this._view = fs.readFileSync(filePath, "utf8");
            
            if (Reflect.hasOwnMetadata(viewLayoutSymbol, this._controller))
            {
                let filePath = Reflect.getOwnMetadata(viewLayoutSymbol, this._controller);
                filePath = path.join(process.cwd(), filePath);
                if (!fs.existsSync(filePath))
                    throw new ArgumentException("viewLayoutFilePath[{0}]".format(filePath), "does not exist");

                this._viewLayout = fs.readFileSync(filePath, "utf8");
            }
        }    
    }
}