import { Bundle } from "./bundle";
import { BundleFile } from "./bundle-file";
import * as Path from "path";


// public
export class TemplateBundle extends Bundle
{
    protected renderBundle(): string
    {
        let files = new Array<BundleFile>();
        this.entries.forEach(t => files.push(...t.read(".html")));

        let result = "";
        for (let item of files)
        {
            let fileName = Path.basename(item.path);
            let id = fileName.replace(".html", "").split("-").join("");
            let fileContent = item.content;
            let template = `<script type="text/x-template" id="${id}">${fileContent}</script>`;
            result = result + template;
        }
        return result;
    }
}