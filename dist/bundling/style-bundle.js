"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bundle_1 = require("./bundle");
// public
class StyleBundle extends bundle_1.Bundle {
    renderBundle() {
        let files = new Array();
        this.entries.forEach(t => files.push(...t.read(".css")));
        let result = "";
        if (this.isDev) {
            for (let item of files)
                result += `<link rel = "stylesheet" type = "text/css" href = "${item.path}" />`;
        }
        else {
            for (let item of files)
                result += item.content;
            result = `<style>${result}</style>`;
        }
        return result;
    }
}
exports.StyleBundle = StyleBundle;
//# sourceMappingURL=style-bundle.js.map