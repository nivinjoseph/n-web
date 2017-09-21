"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
const bundle_1 = require("./bundle");
const Path = require("path");
const Fs = require("fs");
const n_exception_1 = require("n-exception");
require("n-ext");
const Crypto = require("crypto");
const Os = require("os");
class ServedBundle extends bundle_1.Bundle {
    constructor(name, bundlePath, servePath) {
        n_defensive_1.given(servePath, "servePath").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        n_defensive_1.given(bundlePath, "bundlePath").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        bundlePath = bundlePath.trim();
        bundlePath = Path.join(process.cwd(), bundlePath);
        if (!Fs.existsSync(bundlePath))
            throw new n_exception_1.ArgumentException(`bundlePath[${bundlePath}]`, "does not exist");
        if (!Fs.statSync(bundlePath).isDirectory())
            throw new n_exception_1.ArgumentException(`bundlePath[${bundlePath}]`, "is not a directory");
        super(name);
        this._bundlePath = bundlePath;
        servePath = servePath.trim();
        if (servePath.startsWith("/"))
            servePath = servePath.substr(1);
        this._servePath = servePath;
        if (!this._bundlePath.contains(this._servePath))
            throw new n_exception_1.ArgumentException(`servePath[${this._servePath}]`, `is not related to bundlePath[${this._bundlePath}]`);
    }
    createBundle(fileExt) {
        n_defensive_1.given(fileExt, "fileExt").ensureHasValue()
            .ensure(t => !t.isEmptyOrWhiteSpace() && t.trim().startsWith("."));
        fileExt = fileExt.trim();
        this.deletePreviousBundles(fileExt);
        let files = this.getFiles(fileExt);
        let content = "";
        files.forEach(t => content += Os.EOL + t.read());
        let hash = Crypto.createHash("sha256");
        hash.update(content);
        let hashValue = hash.digest("hex");
        let bundleFileName = `${this.name}_${hashValue}${fileExt}`;
        let bundleFilePath = Path.join(this._bundlePath, bundleFileName);
        Fs.writeFileSync(bundleFilePath, content);
        return Path.join(this._servePath, bundleFileName);
    }
    deletePreviousBundles(fileExt) {
        let files = Fs.readdirSync(this._bundlePath);
        for (let item of files) {
            if (item.startsWith(this.name + "_") && item.endsWith(fileExt))
                Fs.unlinkSync(Path.join(this._bundlePath, item));
        }
    }
}
exports.ServedBundle = ServedBundle;
//# sourceMappingURL=served-bundle.js.map