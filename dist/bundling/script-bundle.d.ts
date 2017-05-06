import { ServedBundle } from "./served-bundle";
export declare class ScriptBundle extends ServedBundle {
    protected renderBundle(): Promise<string>;
}
