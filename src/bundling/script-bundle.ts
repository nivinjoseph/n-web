import { Bundle } from "./bundle";
import { BundleFile } from "./bundle-file";
import * as Path from "path";


// public
export class ScriptBundle extends Bundle
{
    protected renderBundle(): string
    {
        let files = new Array<BundleFile>();
        this.entries.forEach(t => files.push(...t.read(".js")));
        
        let result = "";
        
        if (this.isDev)
        {
            for (let item of files)
                result += `<script src="${item.path}"></script>`; 
        } 
        else
        {
            for (let item of files)
                result += item.content;    
            
            result = `<script>${result}</script>`;
        }
        
        return result;
    }
}