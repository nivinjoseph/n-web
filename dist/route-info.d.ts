import "n-ext";
import { RouteParam } from "./route-param";
export declare class RouteInfo {
    private readonly _routeTemplate;
    private readonly _routeParams;
    private readonly _routeParamsRegistry;
    private readonly _koaRoute;
    readonly route: string;
    readonly koaRoute: string;
    readonly params: ReadonlyArray<RouteParam>;
    constructor(routeTemplate: string);
    findRouteParam(key: string): RouteParam;
    generateUrl(values: any): string;
    private populateRouteParams();
    private extractTemplateParams(routeTemplate);
    private generateKoaRoute(routeTemplate);
}
