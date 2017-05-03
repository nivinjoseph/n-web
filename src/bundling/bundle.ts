import { given } from "n-defensive";
import { BundleEntry } from "./bundle-entry";
import { ArgumentException } from "n-exception";
import { ConfigurationManager } from "n-config";
import { BundleCache } from "./bundle-cache";
import * as Path from "path";
import "n-ext";
import { BundleFile } from "./bundle-file";

export abstract class Bundle
{
    private readonly _name: string;
    private readonly _entries = new Array<BundleEntry>();
    
    
    protected get name(): string { return this._name; }
    
    
    public constructor(name: string)
    {
        given(name, "name").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        this._name = name.trim();
    }
    
    
    public include(path: string): this
    {
        let entry = new BundleEntry(path);
        this._entries.push(entry);
        return this;
    }
    
    public render(): string
    {
        let result: string = null;
        
        if (!this.isDev)
        {
            result = BundleCache.find(this._name);
            if (result)
                return result;
        } 
        
        result = this.renderBundle();
        
        if (!this.isDev)
            BundleCache.add(this._name, result);
        
        return result;
    }
    
    
    protected abstract renderBundle(): string;
    
    protected getFiles(fileExt: string): ReadonlyArray<BundleFile>
    {
        given(fileExt, "fileExt").ensureHasValue()
            .ensure(t => !t.isEmptyOrWhiteSpace() && t.trim().startsWith("."));

        fileExt = fileExt.trim();

        let files = new Array<BundleFile>();
        this._entries.forEach(t => files.push(...t.getFiles(fileExt)));
        return files;
    }
    
    protected isDev(): boolean
    {
        let mode = ConfigurationManager.getConfig<string>("mode");
        return mode !== null && mode.trim().toLowerCase() === "dev";
    }
}