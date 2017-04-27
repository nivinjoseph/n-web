import "n-ext";
export declare class ClientViewTemplateBundler {
    private readonly _path;
    private readonly _cache;
    constructor(path: string, cache?: boolean);
    render(): string;
    private accumulateFilesToProcess(filePath, accumulator);
}
