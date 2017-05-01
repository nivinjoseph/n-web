import { given } from "n-defensive";
import * as Fs from "fs";
import * as Path from "path";
import { ArgumentException } from "n-exception";

export class BundleFile
{
    private readonly _path: string;
    private readonly _content: string;
    
    
    public get path(): string { return this._path; }
    public get content(): string { return this._content; }
    
    
    public constructor(path: string)
    {
        given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());

        path = path.trim();
        let cwd = process.cwd();
        if (path.startsWith(cwd))
            path = path.replace(cwd, "");    
        
        
        if (!path.startsWith("/"))
            path = "/" + path;
        
        let fullPath = Path.join(process.cwd(), path);

        if (!Fs.existsSync(fullPath))
            throw new ArgumentException(`path [${fullPath}]`, "does not exist");
        
        this._path = path;
        this._content = Fs.readFileSync(fullPath, "utf8");
    }
}