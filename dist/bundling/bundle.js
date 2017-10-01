"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
const bundle_entry_1 = require("./bundle-entry");
const n_config_1 = require("n-config");
const bundle_cache_1 = require("./bundle-cache");
require("n-ext");
class Bundle {
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
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            if (!this.isDev) {
                result = bundle_cache_1.BundleCache.find(this._name);
                if (result)
                    return result;
            }
            result = yield this.renderBundle();
            if (!this.isDev)
                bundle_cache_1.BundleCache.add(this._name, result);
            return result;
        });
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
        let env = n_config_1.ConfigurationManager.getConfig("env");
        return env !== null && env.trim().toLowerCase() === "dev";
    }
}
exports.Bundle = Bundle;
//# sourceMappingURL=bundle.js.map