"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bundle_1 = require("./bundle");
// public
class TemplateBundle extends bundle_1.Bundle {
    renderBundle() {
        let files = this.getFiles(".html");
        let result = "";
        for (let item of files) {
            let id = item.name.replace(".html", "").split("-").join("");
            let fileContent = item.read();
            let template = `<script type="text/x-template" id="${id}">${fileContent}</script>`;
            result += template;
        }
        return result;
    }
}
exports.TemplateBundle = TemplateBundle;
//# sourceMappingURL=template-bundle.js.map