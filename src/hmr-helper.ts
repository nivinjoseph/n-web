import { IFs, fs } from "memfs";
import * as path from "path";


export class HmrHelper
{
    private static _devFs: IFs = fs;
    private static _outputPath: string = null;
    
    
    public static get devFs(): IFs { return this._devFs; }
    public static get outputPath(): string { return this._outputPath; }
    
        
    /**
     * @static
     */
    private constructor() { }
    
    
    public static configure(): void
    {    
        const config = require(path.join(process.cwd(), "webpack.config.js"));
        this._outputPath = config.output.path;
    }
}