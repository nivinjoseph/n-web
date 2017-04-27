"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const n_defensive_1 = require("n-defensive");
require("n-ext");
const n_exception_1 = require("n-exception");
let templates = {};
// public
class ClientViewTemplateBundler {
    constructor(path, cache) {
        this._cache = false;
        n_defensive_1.given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._path = path.trim();
        if (cache)
            this._cache = true;
    }
    render() {
        if (this._cache && templates[this._path])
            return templates[this._path];
        let filePath = path.join(process.cwd(), this._path);
        if (!fs.existsSync(filePath))
            throw new n_exception_1.ArgumentException(`Path [${filePath}]`, "does not exist");
        if (!filePath.endsWith(".html") && !fs.statSync(filePath).isDirectory())
            throw new n_exception_1.ArgumentException(`Path [${filePath}]`, "is not a .html file or directory");
        let filesToProcess = new Array();
        this.accumulateFilesToProcess(filePath, filesToProcess);
        let result = "";
        for (let item of filesToProcess) {
            let fileName = path.basename(item);
            let id = fileName.replace(".html", "").split("-").join("");
            let fileContent = fs.readFileSync(item, "utf8");
            let template = `<script type="text/x-template" id="${id}">${fileContent}</script>`;
            result = result + template;
        }
        if (this._cache)
            templates[this._path] = result;
        return result;
    }
    accumulateFilesToProcess(filePath, accumulator) {
        if (filePath.endsWith(".html")) {
            accumulator.push(filePath);
            return;
        }
        if (fs.statSync(filePath).isDirectory()) {
            let files = fs.readdirSync(filePath);
            for (let item of files)
                this.accumulateFilesToProcess(path.join(filePath, item), accumulator);
        }
    }
}
exports.ClientViewTemplateBundler = ClientViewTemplateBundler;
//# sourceMappingURL=client-view-template-bundler.js.map