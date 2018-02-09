"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("@nivinjoseph/n-defensive");
require("@nivinjoseph/n-ext");
class DefaultCallContext {
    constructor() {
        this._hasAuth = false;
    }
    get dependencyScope() { return this._ctx.state.scope; }
    get pathParams() { return JSON.parse(JSON.stringify(this._ctx.params)); }
    get queryParams() { return JSON.parse(JSON.stringify(this._ctx.query)); }
    get hasAuth() { return this._hasAuth; }
    get authScheme() { return this._authScheme; }
    get authToken() { return this._authToken; }
    get isAuthenticated() { return this.identity !== undefined && this.identity !== null; }
    get identity() { return this._ctx.state.identity; }
    configure(ctx) {
        n_defensive_1.given(ctx, "ctx").ensureHasValue();
        this._ctx = ctx;
        this.populateSchemeAndToken();
    }
    setResponseType(responseType) {
        n_defensive_1.given(responseType, "responseType")
            .ensureHasValue()
            .ensureIsString()
            .ensure(t => !t.isEmptyOrWhiteSpace());
        this._ctx.response.type = responseType.trim();
    }
    setResponseContentDisposition(contentDisposition) {
        n_defensive_1.given(contentDisposition, "contentDisposition")
            .ensureHasValue()
            .ensureIsString()
            .ensure(t => !t.isEmptyOrWhiteSpace());
        this._ctx.response.set({
            "Content-Disposition": contentDisposition.trim()
        });
    }
    populateSchemeAndToken() {
        if (this._ctx.header && this._ctx.header.authorization) {
            let authorization = this._ctx.header.authorization;
            if (!authorization.isEmptyOrWhiteSpace()) {
                authorization = authorization.trim();
                while (authorization.contains("  "))
                    authorization = authorization.replaceAll("  ", " ");
                let splitted = authorization.split(" ");
                if (splitted.length === 2) {
                    let scheme = splitted[0].trim().toLowerCase();
                    let token = splitted[1].trim();
                    if (!scheme.isEmptyOrWhiteSpace() && !token.isEmptyOrWhiteSpace()) {
                        this._hasAuth = true;
                        this._authScheme = scheme;
                        this._authToken = token;
                    }
                }
            }
        }
    }
}
exports.DefaultCallContext = DefaultCallContext;
//# sourceMappingURL=default-call-context.js.map