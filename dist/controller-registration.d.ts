import "@nivinjoseph/n-ext";
import { Claim } from "@nivinjoseph/n-sec";
import { RouteInfo } from "./route-info.js";
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
    get hasView(): boolean;
    get hasViewLayout(): boolean;
    get authorizeClaims(): ReadonlyArray<Claim> | null;
    constructor(controller: Function);
    complete(viewResolutionRoot?: string): void;
    retrieveView(): Promise<string | null>;
    retrieveViewLayout(): Promise<string | null>;
    private _configureViews;
    private _resolvePath;
    private _isDev;
}
//# sourceMappingURL=controller-registration.d.ts.map