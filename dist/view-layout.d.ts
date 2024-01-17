import { Controller, ControllerClass } from "./controller.js";
export declare const viewLayoutSymbol: unique symbol;
export declare function viewLayout<This extends Controller>(file: string): ControllerViewLayoutDecorator<This>;
export type ControllerViewLayoutDecorator<This extends Controller> = (target: ControllerClass<This>, context: ClassDecoratorContext<ControllerClass<This>>) => void;
//# sourceMappingURL=view-layout.d.ts.map