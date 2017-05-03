import { Bundle } from "./bundle";
import { BundleFile } from "./bundle-file";
import * as Path from "path";


// public
export class TemplateBundle extends Bundle
{
    protected renderBundle(): string
    {
        let files = this.getFiles(".html");
        let result = "";
        for (let item of files)
        {
            let id = item.name.replace(".html", "").split("-").join("");
            let fileContent = item.read();
            let template = `<script type="text/x-template" id="${id}">${fileContent}</script>`;
            result += template;
        }
        return result;
    }
}