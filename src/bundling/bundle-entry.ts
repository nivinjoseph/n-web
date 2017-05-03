import { given } from "n-defensive";
import * as Fs from "fs";
import * as Path from "path";
import { ArgumentException } from "n-exception";
import { BundleFile } from "./bundle-file";


export class BundleEntry
{
    private readonly _path: string;
    private readonly _isDir: boolean;
    
    
    public constructor(path: string)
    {
        given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        path = path.trim();
        
        path = Path.join(process.cwd(), path);
        
        if (!Fs.existsSync(path))
            throw new ArgumentException(`path [${path}]`, "does not exist");

        this._path = path;
        this._isDir = Fs.statSync(path).isDirectory();
    }
    
    
    public getFiles(filterExt?: string): Array<BundleFile>
    {
        filterExt = filterExt ? filterExt.trim() : null;
                
        let result = new Array<BundleFile>();
        this.accumulateFilesToProcess(this._path, filterExt, result);
        return result;
    }
    
    
    private accumulateFilesToProcess(path: string, filterExt: string, accumulator: Array<BundleFile>): void
    {
        if (!Fs.statSync(path).isDirectory())
        {
            if (filterExt)
            {
                if (path.endsWith(filterExt))
                    accumulator.push(new BundleFile(path));
            }
            else
            {
                accumulator.push(new BundleFile(path));
            }    
        }
        else
        {
            let files = Fs.readdirSync(path);
            for (let item of files)
                this.accumulateFilesToProcess(Path.join(path, item), filterExt, accumulator);
        }    
    }
}