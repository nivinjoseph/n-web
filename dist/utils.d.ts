import type { ControllerRouteParams } from "./route-params.js";
export declare abstract class Utils {
    static generateUrl<TRoute extends string>(route: TRoute, params?: ControllerRouteParams<TRoute> & Record<string, string | number | boolean | null | undefined>, baseUrl?: string): string;
}
//# sourceMappingURL=utils.d.ts.map