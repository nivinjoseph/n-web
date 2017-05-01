import { Bundle } from "./bundle";
import { BundleFile } from "./bundle-file";


// public
export class StyleBundle extends Bundle
{
    protected renderBundle(): string
    {
        let files = new Array<BundleFile>();
        this.entries.forEach(t => files.push(...t.read(".css")));
        
        let result = "";
        
        if (this.isDev)
        {
            for (let item of files)
                result += `<link rel = "stylesheet" type = "text/css" href = "${item.path}" />`;    
        }
        else
        {
            for (let item of files)
                result += item.content;
            
            result = `<style>${result}</style>`;
        }    
        
        return result;
    }
}