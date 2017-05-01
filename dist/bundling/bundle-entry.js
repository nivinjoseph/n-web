"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
const Fs = require("fs");
const Path = require("path");
const n_exception_1 = require("n-exception");
const bundle_file_1 = require("./bundle-file");
class BundleEntry {
    constructor(path) {
        this._isDir = false;
        n_defensive_1.given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        path = path.trim();
        if (!path.startsWith("/"))
            path = "/" + path;
        let fullPath = Path.join(process.cwd(), path);
        if (!Fs.existsSync(fullPath))
            throw new n_exception_1.ArgumentException(`path [${fullPath}]`, "does not exist");
        this._path = path;
        this._fullPath = fullPath;
        this._isDir = Fs.statSync(fullPath).isDirectory();
    }
    get path() { return this._path; }
    get isDir() { return this._isDir; }
    read(filterExt) {
        filterExt = filterExt ? filterExt.trim() : null;
        let result = new Array();
        if (!this._isDir) {
            if (filterExt) {
                if (this._path.endsWith(filterExt))
                    result.push(new bundle_file_1.BundleFile(this._path));
            }
            else {
                result.push(new bundle_file_1.BundleFile(this._path));
            }
        }
        else {
            this.accumulateFilesToProcess(this._fullPath, filterExt, result);
        }
        return result;
    }
    accumulateFilesToProcess(filePath, filterExt, accumulator) {
        if (!Fs.statSync(filePath).isDirectory()) {
            if (filterExt) {
                if (this._path.endsWith(filterExt))
                    accumulator.push(new bundle_file_1.BundleFile(filePath));
            }
            else {
                accumulator.push(new bundle_file_1.BundleFile(filePath));
            }
        }
        else {
            let files = Fs.readdirSync(filePath);
            for (let item of files)
                this.accumulateFilesToProcess(Path.join(filePath, item), filterExt, accumulator);
        }
    }
}
exports.BundleEntry = BundleEntry;
//# sourceMappingURL=bundle-entry.js.map