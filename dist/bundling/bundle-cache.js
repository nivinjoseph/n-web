"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
class BundleCache {
    static find(key) {
        n_defensive_1.given(key, "key").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        key = key.trim();
        if (BundleCache._cache[key])
            return BundleCache._cache[key];
        return null;
    }
    static add(key, value) {
        n_defensive_1.given(key, "key").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        key = key.trim();
        BundleCache._cache[key] = value;
    }
}
BundleCache._cache = {};
exports.BundleCache = BundleCache;
//# sourceMappingURL=bundle-cache.js.map