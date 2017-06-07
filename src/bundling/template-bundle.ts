import { Bundle } from "./bundle";
import { BundleFile } from "./bundle-file";
import * as Path from "path";
import * as Os from "os";
import "n-ext";


// public
export class TemplateBundle extends Bundle
{
    protected renderBundle(): Promise<string>
    {
        let files = this.getFiles(".html");
        let result = "";
        for (let item of files)
        {
            let id = item.name.replace(".html", "").split("-").join("");
            let fileContent = item.read();
            let template = `${Os.EOL}<script type="text/x-template" id="${id}">${Os.EOL}${fileContent}${Os.EOL}</script>${Os.EOL}`;
            result += template;
        }
        
        // if (!this.isDev())
        //     result = result.replaceAll(Os.EOL, ""); 
        
        return Promise.resolve(result);
    }
}