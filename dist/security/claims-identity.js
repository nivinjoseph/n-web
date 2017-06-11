"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
// public
class ClaimsIdentity {
    get claims() { return this._claims; }
    constructor(claims) {
        n_defensive_1.given(claims, "claims").ensureHasValue();
        this._claims = [...claims];
    }
    hasClaim(claim) {
        return this._claims.some(t => t.type === claim.type && t.value === claim.value);
    }
}
exports.ClaimsIdentity = ClaimsIdentity;
//# sourceMappingURL=claims-identity.js.map