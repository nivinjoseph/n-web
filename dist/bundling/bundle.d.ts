import "n-ext";
import { BundleFile } from "./bundle-file";
export declare abstract class Bundle {
    private readonly _name;
    private readonly _entries;
    protected readonly name: string;
    constructor(name: string);
    include(path: string): this;
    render(): string;
    protected abstract renderBundle(): string;
    protected getFiles(fileExt: string): ReadonlyArray<BundleFile>;
    protected isDev(): boolean;
}
