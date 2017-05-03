"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
const Fs = require("fs");
const Path = require("path");
const n_exception_1 = require("n-exception");
const bundle_file_1 = require("./bundle-file");
class BundleEntry {
    constructor(path) {
        n_defensive_1.given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        path = path.trim();
        path = Path.join(process.cwd(), path);
        if (!Fs.existsSync(path))
            throw new n_exception_1.ArgumentException(`path [${path}]`, "does not exist");
        this._path = path;
        this._isDir = Fs.statSync(path).isDirectory();
    }
    getFiles(filterExt) {
        filterExt = filterExt ? filterExt.trim() : null;
        let result = new Array();
        this.accumulateFilesToProcess(this._path, filterExt, result);
        return result;
    }
    accumulateFilesToProcess(path, filterExt, accumulator) {
        if (!Fs.statSync(path).isDirectory()) {
            if (filterExt) {
                if (path.endsWith(filterExt))
                    accumulator.push(new bundle_file_1.BundleFile(path));
            }
            else {
                accumulator.push(new bundle_file_1.BundleFile(path));
            }
        }
        else {
            let files = Fs.readdirSync(path);
            for (let item of files)
                this.accumulateFilesToProcess(Path.join(path, item), filterExt, accumulator);
        }
    }
}
exports.BundleEntry = BundleEntry;
//# sourceMappingURL=bundle-entry.js.map