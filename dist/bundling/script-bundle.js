"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const served_bundle_1 = require("./served-bundle");
// public
class ScriptBundle extends served_bundle_1.ServedBundle {
    renderBundle() {
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
exports.ScriptBundle = ScriptBundle;
//# sourceMappingURL=script-bundle.js.map