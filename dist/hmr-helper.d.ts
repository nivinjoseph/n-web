import MemoryFileSystem = require("memory-fs");
export declare class HmrHelper {
    private static _devFs;
    private static _outputPath;
    static get devFs(): MemoryFileSystem;
    static get outputPath(): string;
    private constructor();
    static configure(devFs: MemoryFileSystem): void;
}
