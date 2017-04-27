import "reflect-metadata";
import { RouteInfo } from "./route-info";
import "n-ext";
export declare class ControllerRegistration {
    private readonly _name;
    private readonly _controller;
    private readonly _method;
    private readonly _route;
    private readonly _viewFileName;
    private readonly _viewFilePath;
    private readonly _viewFileData;
    private readonly _viewLayoutFileName;
    private readonly _viewLayoutFilePath;
    private readonly _viewLayoutFileData;
    readonly name: string;
    readonly controller: Function;
    readonly method: string;
    readonly route: RouteInfo;
    readonly view: string;
    readonly viewLayout: string;
    constructor(controller: Function);
    private resolvePath(startPoint, fileName);
    private retrieveView();
    private retrieveViewLayout();
    private isDev();
}
