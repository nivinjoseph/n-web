import { Controller, type ControllerClass } from "./controller.js";
import type { ControllerRoute } from "./route-params.js";
export declare const httpRouteSymbol: unique symbol;
type EnforceRoute<This, TRoute extends string> = TRoute extends ControllerRoute<This> ? unknown : {
    [K in `Route drift: @route(${TRoute}) does not match the route this controller declares (${ControllerRoute<This>})`]: never;
};
export declare function route<const TRoute extends string>(route: TRoute): <This extends Controller>(target: ControllerClass<This> & EnforceRoute<This, TRoute>, context: ClassDecoratorContext<ControllerClass<This>>) => void;
export type ControllerRouteDecorator<This extends Controller> = (target: ControllerClass<This>, context: ClassDecoratorContext<ControllerClass<This>>) => void;
export {};
//# sourceMappingURL=route.d.ts.map