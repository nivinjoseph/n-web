import { IFs } from "memfs";
import { WebpackDevMiddlewareConfig } from "./webpack-dev-middleware-config";
export declare class HmrHelper {
    private static _devFs;
    private static _outputPath;
    static get devFs(): IFs;
    static get outputPath(): string;
    static get isConfigured(): boolean;
    /**
     * @static
     */
    private constructor();
    static configure(config: WebpackDevMiddlewareConfig): void;
}
//# sourceMappingURL=hmr-helper.d.ts.map