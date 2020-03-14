import MemoryFileSystem = require("memory-fs");
import { given } from "@nivinjoseph/n-defensive";
import * as path from "path";


export class HmrHelper
{
    private static _devFs: MemoryFileSystem = null;
    private static _outputPath: string = null;
    
    
    public static get devFs(): MemoryFileSystem { return this._devFs; }
    public static get outputPath(): string { return this._outputPath; }
    
        
    /**
     * @static
     */
    private constructor() { }
    
    
    public static configure(devFs: MemoryFileSystem): void
    {
        given(devFs, "defFs").ensureHasValue().ensureIsObject();
        
        this._devFs = devFs;
        
        const config = require(path.join(process.cwd(), "webpack.config.js"));
        this._outputPath = config.output.path;
    }
}