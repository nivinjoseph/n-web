import "n-ext";
import { RouteParam } from "./route-param";
export declare class RouteInfo {
    private readonly _routeTemplate;
    private readonly _routeParams;
    private readonly _routeParamsRegistry;
    private readonly _koaRoute;
    private _hasQuery;
    readonly route: string;
    readonly koaRoute: string;
    readonly params: ReadonlyArray<RouteParam>;
    constructor(routeTemplate: string);
    findRouteParam(key: string): RouteParam;
    generateUrl(values: Object): string;
    private populateRouteParams();
    private extractTemplateParams(routeTemplate);
    private generateKoaRoute(routeTemplate);
}
