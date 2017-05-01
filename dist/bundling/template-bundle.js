"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bundle_1 = require("./bundle");
const Path = require("path");
// public
class TemplateBundle extends bundle_1.Bundle {
    renderBundle() {
        let files = new Array();
        this.entries.forEach(t => files.push(...t.read(".html")));
        let result = "";
        for (let item of files) {
            let fileName = Path.basename(item.path);
            let id = fileName.replace(".html", "").split("-").join("");
            let fileContent = item.content;
            let template = `<script type="text/x-template" id="${id}">${fileContent}</script>`;
            result = result + template;
        }
        return result;
    }
}
exports.TemplateBundle = TemplateBundle;
//# sourceMappingURL=template-bundle.js.map