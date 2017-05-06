import { ServedBundle } from "./served-bundle";
import { BundleFile } from "./bundle-file";


// public
export class StyleBundle extends ServedBundle
{
    protected renderBundle(): Promise<string>
    {
        let bundleUrl = this.createBundle(".css");
        let result = `<link rel="stylesheet" type="text/css" href="${bundleUrl}">`;
        return Promise.resolve(result);
        
        
        
        // let files = new Array<BundleFile>();
        // this.entries.forEach(t => files.push(...t.read(".css")));
        
        // let result = "";
        
        // if (this.isDev)
        // {
        //     for (let item of files)
        //         result += `<link rel = "stylesheet" type = "text/css" href = "${item.path}" />`;    
        // }
        // else
        // {
        //     for (let item of files)
        //         result += item.content;
            
        //     result = `<style>${result}</style>`;
        // }    
        
        // return result;
    }
}