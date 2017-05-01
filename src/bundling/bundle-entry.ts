import { given } from "n-defensive";
import * as Fs from "fs";
import * as Path from "path";
import { ArgumentException } from "n-exception";
import { BundleFile } from "./bundle-file";


export class BundleEntry
{
    private readonly _path: string;
    private readonly _fullPath: string;
    private readonly _isDir: boolean = false;
    
    
    public get path(): string { return this._path; }
    public get isDir(): boolean { return this._isDir; }
    
    
    public constructor(path: string)
    {
        given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        path = path.trim();
        if (!path.startsWith("/"))
            path = "/" + path;
        
        let fullPath = Path.join(process.cwd(), path);
        
        if (!Fs.existsSync(fullPath))
            throw new ArgumentException(`path [${fullPath}]`, "does not exist");

        this._path = path;
        this._fullPath = fullPath;
        this._isDir = Fs.statSync(fullPath).isDirectory();
    }
    
    
    public read(filterExt?: string): Array<BundleFile>
    {
        filterExt = filterExt ? filterExt.trim() : null;
                
        let result = new Array<BundleFile>();
        
        if (!this._isDir)
        {
            if (filterExt)
            {
                if (this._path.endsWith(filterExt))
                    result.push(new BundleFile(this._path));
            }
            else
            {
                result.push(new BundleFile(this._path));
            }    
        }  
        else
        {
            this.accumulateFilesToProcess(this._fullPath, filterExt, result);   
        }
        
        return result;
    }
    
    
    private accumulateFilesToProcess(filePath: string, filterExt: string, accumulator: Array<BundleFile>): void
    {
        if (!Fs.statSync(filePath).isDirectory())
        {
            if (filterExt)
            {
                if (filePath.endsWith(filterExt))
                    accumulator.push(new BundleFile(filePath));
            }
            else
            {
                accumulator.push(new BundleFile(filePath));
            }    
        }
        else
        {
            let files = Fs.readdirSync(filePath);
            for (let item of files)
                this.accumulateFilesToProcess(Path.join(filePath, item), filterExt, accumulator);
        }    
    }
    
    
    
}