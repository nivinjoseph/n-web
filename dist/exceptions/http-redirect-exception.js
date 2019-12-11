"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_exception_1 = require("@nivinjoseph/n-exception");
require("@nivinjoseph/n-ext");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
class HttpRedirectException extends n_exception_1.Exception {
    constructor(url) {
        n_defensive_1.given(url, "url").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        super(null);
        this._url = url;
    }
    get url() { return this._url; }
}
exports.HttpRedirectException = HttpRedirectException;
//# sourceMappingURL=http-redirect-exception.js.map