"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
const bundle_entry_1 = require("./bundle-entry");
const n_exception_1 = require("n-exception");
const n_config_1 = require("n-config");
const bundle_cache_1 = require("./bundle-cache");
class Bundle {
    constructor(key) {
        this._entries = new Array();
        n_defensive_1.given(key, "key").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._key = key.trim();
    }
    get key() { return this._key; }
    get entries() { return this._entries; }
    includeFile(filePath) {
        n_defensive_1.given(filePath, "filePath").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        let entry = new bundle_entry_1.BundleEntry(filePath);
        if (entry.isDir)
            throw new n_exception_1.ArgumentException(`Path [${entry.path}]`, "is a directory");
        this._entries.push(entry);
        return this;
    }
    includeDir(dirPath) {
        n_defensive_1.given(dirPath, "dirPath").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        let entry = new bundle_entry_1.BundleEntry(dirPath);
        if (!entry.isDir)
            throw new n_exception_1.ArgumentException(`Path [${entry.path}]`, "is not a directory");
        this._entries.push(entry);
        return this;
    }
    render() {
        let result = null;
        if (!this.isDev) {
            result = bundle_cache_1.BundleCache.find(this._key);
            if (result)
                return result;
        }
        result = this.renderBundle();
        if (!this.isDev)
            bundle_cache_1.BundleCache.add(this._key, result);
        return result;
    }
    isDev() {
        let mode = n_config_1.ConfigurationManager.getConfig("mode");
        return mode !== null && mode.trim().toLowerCase() === "dev";
    }
}
exports.Bundle = Bundle;
//# sourceMappingURL=bundle.js.map