import { IFs } from "memfs";
export declare class HmrHelper {
    private static _devFs;
    private static _outputPath;
    static get devFs(): IFs;
    static get outputPath(): string;
    /**
     * @static
     */
    private constructor();
    static configure(): void;
}
