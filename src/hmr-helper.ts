import { IFs, createFsFromVolume, Volume } from "memfs";
import * as path from "path";
const mkdirp = require("mkdirp");


export class HmrHelper
{
    private static _devFs: IFs = null;
    private static _outputPath: string = null;
    
    
    public static get devFs(): IFs { return this._devFs; }
    public static get outputPath(): string { return this._outputPath; }
    
        
    /**
     * @static
     */
    private constructor() { }
    
    
    public static configure(): void
    {
        const devFs: any = createFsFromVolume(new Volume());
        devFs.join = path.join.bind(path);
        devFs.mkdirp = mkdirp.bind(mkdirp);
        this._devFs = devFs;
        
        const config = require(path.join(process.cwd(), "webpack.config.js"));
        this._outputPath = config.output.path;
    }
}