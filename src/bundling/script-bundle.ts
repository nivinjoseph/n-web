import { ServedBundle } from "./served-bundle";
import { BundleFile } from "./bundle-file";
import * as Path from "path";
import * as Crypto from "crypto";
import * as Fs from "fs";


// public
export class ScriptBundle extends ServedBundle
{
    protected renderBundle(): string
    {
        let bundleUrl = this.createBundle(".js");
        let result = `<script src="${bundleUrl}"></script>`;
        return result;
        
        // if (this.isDev)
        // {
        //     for (let item of files)
        //         result += `<script src="${item.path}"></script>`; 
        // } 
        // else
        // {
        //     for (let item of files)
        //         result += item.content;    
            
        //     result = `<script>${result}</script>`;
        // }
        
        // return result;
    }
}