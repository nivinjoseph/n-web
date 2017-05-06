import { ServedBundle } from "./served-bundle";
export declare class StyleBundle extends ServedBundle {
    protected renderBundle(): Promise<string>;
}
