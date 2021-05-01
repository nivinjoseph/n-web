import "@nivinjoseph/n-ext";
import { RouteParam } from "./route-param";
export declare class RouteInfo {
    private readonly _routeTemplate;
    private readonly _routeParams;
    private readonly _routeParamsRegistry;
    private readonly _koaRoute;
    private readonly _isCatchAll;
    private _hasQuery;
    get route(): string;
    get koaRoute(): string;
    get params(): ReadonlyArray<RouteParam>;
    get isCatchAll(): boolean;
    constructor(routeTemplate: string, isUrlGenerator?: boolean);
    findRouteParam(key: string): RouteParam;
    generateUrl(values: Object): string;
    private populateRouteParams;
    private extractTemplateParams;
    private generateKoaRoute;
}
