import { ClassDefinition } from "@nivinjoseph/n-util";
export declare abstract class Controller {
    abstract execute(...params: Array<any>): Promise<any>;
    protected redirect(url: string): void;
    protected disableCompression(): void;
}
export type ControllerClass<This extends Controller> = ClassDefinition<This>;
//# sourceMappingURL=controller.d.ts.map