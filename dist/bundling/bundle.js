"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
const bundle_entry_1 = require("./bundle-entry");
const n_config_1 = require("n-config");
const bundle_cache_1 = require("./bundle-cache");
require("n-ext");
class Bundle {
    // protected get entries(): ReadonlyArray<BundleEntry> { return this._entries; }
    constructor(name) {
        this._entries = new Array();
        n_defensive_1.given(name, "name").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._name = name.trim();
    }
    get name() { return this._name; }
    include(path) {
        let entry = new bundle_entry_1.BundleEntry(path);
        this._entries.push(entry);
        return this;
    }
    render() {
        let result = null;
        if (!this.isDev) {
            result = bundle_cache_1.BundleCache.find(this._name);
            if (result)
                return result;
        }
        result = this.renderBundle();
        if (!this.isDev)
            bundle_cache_1.BundleCache.add(this._name, result);
        return result;
    }
    getFiles(fileExt) {
        n_defensive_1.given(fileExt, "fileExt").ensureHasValue()
            .ensure(t => !t.isEmptyOrWhiteSpace() && t.trim().startsWith("."));
        fileExt = fileExt.trim();
        let files = new Array();
        this._entries.forEach(t => files.push(...t.getFiles(fileExt)));
        return files;
    }
    isDev() {
        let mode = n_config_1.ConfigurationManager.getConfig("mode");
        return mode !== null && mode.trim().toLowerCase() === "dev";
    }
}
exports.Bundle = Bundle;
//# sourceMappingURL=bundle.js.map