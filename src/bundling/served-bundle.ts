import { given } from "n-defensive";
import { Bundle } from "./bundle";
import * as Path from "path";
import * as Fs from "fs";
import { ArgumentException } from "n-exception";
import "n-ext";
import { BundleFile } from "./bundle-file"; 
import * as Crypto from "crypto";
import * as Os from "os";

export abstract class ServedBundle extends Bundle
{
    private readonly _bundlePath: string;
    private readonly _servePath: string;
    
    
    public constructor(name: string, bundlePath: string, servePath: string)
    {
        given(servePath, "servePath").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        given(bundlePath, "bundlePath").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        bundlePath = bundlePath.trim();
        bundlePath = Path.join(process.cwd(), bundlePath);
        
        if (!Fs.existsSync(bundlePath))
            throw new ArgumentException(`bundlePath[${bundlePath}]`, "does not exist");
        
        super(name);
        
        this._bundlePath = bundlePath;
        
        servePath = servePath.trim();
        if (servePath.startsWith("/"))
            servePath = servePath.substr(1);
        this._servePath = servePath;
        
        if (!this._bundlePath.contains(this._servePath))
            throw new ArgumentException(`servePath[${this._servePath}]`, `is not related to bundlePath[${this._bundlePath}]`);    
    }
    
    
    protected createBundle(fileExt: string): string
    {
        given(fileExt, "fileExt").ensureHasValue()
            .ensure(t => !t.isEmptyOrWhiteSpace() && t.trim().startsWith("."));

        fileExt = fileExt.trim();
        
        this.deletePreviousBundles(fileExt);
        
        let files = this.getFiles(fileExt);

        let content = "";
        files.forEach(t => content += Os.EOL + t.read());

        let hash = Crypto.createHash("sha256");
        hash.update(content);
        let hashValue = hash.digest("hex");

        let bundleFileName = `${this.name}_${hashValue}${fileExt}`;
        let bundleFilePath = Path.join(this._bundlePath, bundleFileName);

        Fs.writeFileSync(bundleFilePath, content);
        
        return Path.join(this._servePath, bundleFileName);
    }
    
    private deletePreviousBundles(fileExt: string): void
    {
        let files = Fs.readdirSync(this._bundlePath);
        for (let item of files)
        {
            if (item.startsWith(this.name + "_") && item.endsWith(fileExt))
                Fs.unlinkSync(Path.join(this._bundlePath, item));    
        }    
    }
}