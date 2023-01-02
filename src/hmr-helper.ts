import { given } from "@nivinjoseph/n-defensive";
import { IFs, createFsFromVolume, Volume } from "memfs";
import * as path from "path";
const mkdirp = require("mkdirp");


export class HmrHelper
{
    private static _devFs: IFs | null = null;
    private static _outputPath: string | null = null;
    
    
    public static get devFs(): IFs
    {
        given(this, "this").ensure(_ => HmrHelper._devFs != null, "not configured");
        return this._devFs!;
    }
    public static get outputPath(): string
    {
        given(this, "this").ensure(_ => HmrHelper._outputPath != null, "not configured");
        return this._outputPath!;
    }
    
    public static get isConfigured(): boolean { return this._devFs != null && this._outputPath != null; }
    
        
    /**
     * @static
     */
    private constructor() { }
    
    
    public static configure(webpackConfig: { output: { path: string; }; }): void
    {
        given(webpackConfig, "webpackConfig").ensureHasValue().ensureIsObject();
        
        const devFs: any = createFsFromVolume(new Volume());
        devFs.join = path.join.bind(path);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        devFs.mkdirp = mkdirp.bind(mkdirp);
        this._devFs = devFs;
        
        // const config = require(path.join(process.cwd(), "webpack.config.js"));
        this._outputPath = webpackConfig.output.path;
    }
}