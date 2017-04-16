import "reflect-metadata";
import { Route } from "./route";
import "n-ext";
export declare class ControllerRegistration {
    private readonly _name;
    private readonly _controller;
    private readonly _method;
    private readonly _route;
    private readonly _view;
    private readonly _viewLayout;
    readonly name: string;
    readonly controller: Function;
    readonly method: string;
    readonly route: Route;
    readonly view: string;
    readonly viewLayout: string;
    constructor(controller: Function);
}
