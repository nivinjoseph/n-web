"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_exception_1 = require("n-exception");
require("n-ext");
const n_defensive_1 = require("n-defensive");
class HttpRedirectException extends n_exception_1.Exception {
    get url() { return this._url; }
    constructor(url) {
        n_defensive_1.given(url, "url").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        super(null);
        this._url = url;
    }
}
exports.HttpRedirectException = HttpRedirectException;
//# sourceMappingURL=http-redirect-exception.js.map