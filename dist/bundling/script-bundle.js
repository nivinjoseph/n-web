"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bundle_1 = require("./bundle");
// public
class ScriptBundle extends bundle_1.Bundle {
    renderBundle() {
        let files = new Array();
        this.entries.forEach(t => files.push(...t.read(".js")));
        let result = "";
        if (this.isDev) {
            for (let item of files)
                result += `<script src="${item.path}"></script>`;
        }
        else {
            for (let item of files)
                result += item.content;
            result = `<script>${result}</script>`;
        }
        return result;
    }
}
exports.ScriptBundle = ScriptBundle;
//# sourceMappingURL=script-bundle.js.map