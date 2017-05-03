export declare class BundleFile {
    private readonly _name;
    private readonly _path;
    readonly name: string;
    constructor(path: string);
    read(): string;
}
