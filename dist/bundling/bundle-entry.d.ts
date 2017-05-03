import { BundleFile } from "./bundle-file";
export declare class BundleEntry {
    private readonly _path;
    private readonly _isDir;
    constructor(path: string);
    getFiles(filterExt?: string): Array<BundleFile>;
    private accumulateFilesToProcess(path, filterExt, accumulator);
}
