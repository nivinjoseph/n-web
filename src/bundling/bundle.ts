import { given } from "n-defensive";
import { BundleEntry } from "./bundle-entry";
import { ArgumentException } from "n-exception";
import { ConfigurationManager } from "n-config";
import { BundleCache } from "./bundle-cache";

export abstract class Bundle
{
    private readonly _key: string;
    private readonly _entries = new Array<BundleEntry>();
    
    
    protected get key(): string { return this._key; }
    protected get entries(): ReadonlyArray<BundleEntry> { return this._entries; }
    
    
    protected constructor(key: string)
    {
        given(key, "key").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        this._key = key.trim();
    }
    
    
    public includeFile(filePath: string): this
    {
        given(filePath, "filePath").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        let entry = new BundleEntry(filePath);
        if (entry.isDir)
            throw new ArgumentException(`Path [${entry.path}]`, "is a directory");
        
        this._entries.push(entry);
        return this;
    }
    
    public includeDir(dirPath: string): this
    {
        given(dirPath, "dirPath").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());

        let entry = new BundleEntry(dirPath);
        if (!entry.isDir)
            throw new ArgumentException(`Path [${entry.path}]`, "is not a directory");

        this._entries.push(entry);
        return this;
    }
    
    public render(): string
    {
        let result: string = null;
        
        if (!this.isDev)
        {
            result = BundleCache.find(this._key);
            if (result)
                return result;
        } 
        
        result = this.renderBundle();
        
        if (!this.isDev)
            BundleCache.add(this._key, result);
        
        return result;
    }
    
    
    protected abstract renderBundle(): string;
    
    protected isDev(): boolean
    {
        let mode = ConfigurationManager.getConfig<string>("mode");
        return mode !== null && mode.trim().toLowerCase() === "dev";
    }
}