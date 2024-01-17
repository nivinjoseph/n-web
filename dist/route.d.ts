import { Controller, ControllerClass } from "./controller.js";
export declare const httpRouteSymbol: unique symbol;
export declare function route<This extends Controller>(route: string): ControllerRouteDecorator<This>;
export type ControllerRouteDecorator<This extends Controller> = (target: ControllerClass<This>, context: ClassDecoratorContext<ControllerClass<This>>) => void;
//# sourceMappingURL=route.d.ts.map