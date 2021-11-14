import { IFs, fs } from "memfs";
import * as path from "path";


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
        const devFs: any = fs;
        devFs.join = path.join.bind(path); // no need to bind
        this._devFs = devFs;
        
        const config = require(path.join(process.cwd(), "webpack.config.js"));
        this._outputPath = config.output.path;
    }
}