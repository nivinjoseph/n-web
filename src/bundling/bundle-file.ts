import { given } from "n-defensive";
import * as Fs from "fs";
import * as Path from "path";
import { ArgumentException } from "n-exception";

export class BundleFile
{
    private readonly _name: string;
    private readonly _path: string;

    
    public get name(): string { return this._name; }
    
    
    public constructor(path: string)
    {
        given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        this._name = Path.basename(path);
        this._path = path;
    }
    
    
    public read(): string
    {
        return Fs.readFileSync(this._path, "utf8");
    }
}