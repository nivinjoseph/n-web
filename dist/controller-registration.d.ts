import "reflect-metadata";
import { RouteInfo } from "./route-info";
import "@nivinjoseph/n-ext";
import { Claim } from "@nivinjoseph/n-sec";
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
    private _authorizeClaims;
    get name(): string;
    get controller(): Function;
    get method(): string;
    get route(): RouteInfo;
    get view(): string | null;
    get viewLayout(): string | null;
    get authorizeClaims(): ReadonlyArray<Claim> | null;
    constructor(controller: Function);
    complete(viewResolutionRoot?: string): void;
    private _configureViews;
    private _resolvePath;
    private _retrieveView;
    private _retrieveViewLayout;
    private _isDev;
}
//# sourceMappingURL=controller-registration.d.ts.map