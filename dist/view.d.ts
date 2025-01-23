import { Controller, type ControllerClass } from "./controller.js";
export declare const viewSymbol: unique symbol;
export declare function view<This extends Controller>(file: string): ControllerViewDecorator<This>;
export type ControllerViewDecorator<This extends Controller> = (target: ControllerClass<This>, context: ClassDecoratorContext<ControllerClass<This>>) => void;
//# sourceMappingURL=view.d.ts.map