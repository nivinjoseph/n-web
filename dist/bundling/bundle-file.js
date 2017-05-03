"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
const Fs = require("fs");
const Path = require("path");
class BundleFile {
    get name() { return this._name; }
    constructor(path) {
        n_defensive_1.given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._name = Path.basename(path);
        this._path = path;
    }
    read() {
        return Fs.readFileSync(this._path, "utf8");
    }
}
exports.BundleFile = BundleFile;
//# sourceMappingURL=bundle-file.js.map