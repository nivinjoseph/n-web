import { Controller, ControllerClass } from "./controller.js";
export declare class HttpMethods {
    private static readonly _get;
    private static readonly _post;
    private static readonly _put;
    private static readonly _delete;
    static get Get(): string;
    static get Post(): string;
    static get Put(): string;
    static get Delete(): string;
}
export declare const httpMethodSymbol: unique symbol;
export declare function httpGet<This extends Controller>(target: ControllerClass<This>, context: ClassDecoratorContext<ControllerClass<This>>): void;
export declare function httpPost<This extends Controller>(target: ControllerClass<This>, context: ClassDecoratorContext<ControllerClass<This>>): void;
export declare function httpPut<This extends Controller>(target: ControllerClass<This>, context: ClassDecoratorContext<ControllerClass<This>>): void;
export declare function httpDelete<This extends Controller>(target: ControllerClass<This>, context: ClassDecoratorContext<ControllerClass<This>>): void;
//# sourceMappingURL=http-method.d.ts.map