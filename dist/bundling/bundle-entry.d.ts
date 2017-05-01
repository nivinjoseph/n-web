import { BundleFile } from "./bundle-file";
export declare class BundleEntry {
    private readonly _path;
    private readonly _fullPath;
    private readonly _isDir;
    readonly path: string;
    readonly isDir: boolean;
    constructor(path: string);
    read(filterExt?: string): Array<BundleFile>;
    private accumulateFilesToProcess(filePath, filterExt, accumulator);
}
