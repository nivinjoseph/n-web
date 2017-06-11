"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
class DefaultCallContext {
    constructor() {
        this._hasAuth = false;
    }
    get dependencyScope() { return this._ctx.state.scope; }
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