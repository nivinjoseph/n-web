"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
require("n-ext");
// public
class Claim {
    get type() { return this._type; }
    get value() { return this._value; }
    constructor(type, value) {
        n_defensive_1.given(type, "type").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._type = type.trim();
        this._value = value;
    }
}
exports.Claim = Claim;
//# sourceMappingURL=claim.js.map