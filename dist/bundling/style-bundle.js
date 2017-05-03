"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const served_bundle_1 = require("./served-bundle");
// public
class StyleBundle extends served_bundle_1.ServedBundle {
    renderBundle() {
        let bundleUrl = this.createBundle(".js");
        let result = `<link rel="stylesheet" type="text/css" href="${bundleUrl}">`;
        return result;
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
exports.StyleBundle = StyleBundle;
//# sourceMappingURL=style-bundle.js.map