"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bundle_1 = require("./bundle");
const Os = require("os");
require("n-ext");
// public
class TemplateBundle extends bundle_1.Bundle {
    renderBundle() {
        let files = this.getFiles(".html");
        let result = "";
        for (let item of files) {
            let id = item.name.replace(".html", "").split("-").join("");
            let fileContent = item.read();
            let template = `${Os.EOL}<script type="text/x-template" id="${id}">${Os.EOL}${fileContent}${Os.EOL}</script>${Os.EOL}`;
            result += template;
        }
        if (!this.isDev())
            result = result.replaceAll(Os.EOL, "");
        return Promise.resolve(result);
    }
}
exports.TemplateBundle = TemplateBundle;
//# sourceMappingURL=template-bundle.js.map