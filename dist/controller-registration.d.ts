import "reflect-metadata";
import { RouteInfo } from "./route-info";
import "n-ext";
export declare class ControllerRegistration {
    private readonly _name;
    private readonly _controller;
    private _method;
    private _route;
    private _viewFileName;
    private _viewFilePath;
    private _viewFileData;
    private _viewLayoutFileName;
    private _viewLayoutFilePath;
    private _viewLayoutFileData;
    readonly name: string;
    readonly controller: Function;
    readonly method: string;
    readonly route: RouteInfo;
    readonly view: string;
    readonly viewLayout: string;
    constructor(controller: Function);
    complete(viewResolutionRoot: string): void;
    private resolvePath(startPoint, fileName);
    private retrieveView();
    private retrieveViewLayout();
    private isDev();
}
