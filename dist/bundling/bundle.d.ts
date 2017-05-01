import { BundleEntry } from "./bundle-entry";
export declare abstract class Bundle {
    private readonly _key;
    private readonly _entries;
    protected readonly key: string;
    protected readonly entries: ReadonlyArray<BundleEntry>;
    constructor(key: string);
    includeFile(filePath: string): this;
    includeDir(dirPath: string): this;
    render(): string;
    protected abstract renderBundle(): string;
    protected isDev(): boolean;
}
