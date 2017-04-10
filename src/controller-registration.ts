import "reflect-metadata";
import { given } from "n-defensive";
import { ApplicationException } from "n-exception";
import { httpMethodSymbol, HttpMethods } from "./http-method";
import { httpRouteSymbol } from "./http-route";
import { Route } from "./route";

export class ControllerRegistration
{
    private readonly _name: string;
    private readonly _controller: Function;
    private readonly _method: string;
    private readonly _route: Route;


    public get name(): string { return this._name; }
    public get controller(): Function { return this._controller; }
    public get method(): string { return this._method; }
    public get route(): Route { return this._route; }


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
    }
}