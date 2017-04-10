import "reflect-metadata";
import { Route } from "./route";
export declare class ControllerRegistration {
    private readonly _name;
    private readonly _controller;
    private readonly _method;
    private readonly _route;
    readonly name: string;
    readonly controller: Function;
    readonly method: string;
    readonly route: Route;
    constructor(controller: Function);
}
