import { Bundle } from "./bundle";
import "n-ext";
export declare abstract class ServedBundle extends Bundle {
    private readonly _bundlePath;
    private readonly _servePath;
    constructor(name: string, bundlePath: string, servePath: string);
    protected createBundle(fileExt: string): string;
}
