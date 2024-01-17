import { Claim } from "@nivinjoseph/n-sec";
import { Controller, ControllerClass } from "../controller.js";
export declare const authorizeSymbol: unique symbol;
export declare function authorize<This extends Controller>(...claims: Array<Claim>): ControllerAuthorizeDecorator<This>;
export type ControllerAuthorizeDecorator<This extends Controller> = (target: ControllerClass<This>, context: ClassDecoratorContext<ControllerClass<This>>) => void;
//# sourceMappingURL=authorize.d.ts.map