"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
const Fs = require("fs");
const Path = require("path");
const n_exception_1 = require("n-exception");
class BundleFile {
    get path() { return this._path; }
    get content() { return this._content; }
    constructor(path) {
        n_defensive_1.given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        path = path.trim();
        let cwd = process.cwd();
        if (path.startsWith(cwd))
            path = path.replace(cwd, "");
        if (!path.startsWith("/"))
            path = "/" + path;
        let fullPath = Path.join(process.cwd(), path);
        if (!Fs.existsSync(fullPath))
            throw new n_exception_1.ArgumentException(`path [${fullPath}]`, "does not exist");
        this._path = path;
        this._content = Fs.readFileSync(fullPath, "utf8");
    }
}
exports.BundleFile = BundleFile;
//# sourceMappingURL=bundle-file.js.map