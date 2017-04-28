"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const n_defensive_1 = require("n-defensive");
require("n-ext");
exports.viewLayoutSymbol = Symbol("viewLayout");
// public
function viewLayout(file) {
    n_defensive_1.given(file, "file")
        .ensureHasValue()
        .ensure(t => !t.isEmptyOrWhiteSpace());
    return (target) => Reflect.defineMetadata(exports.viewLayoutSymbol, file.trim(), target);
}
exports.viewLayout = viewLayout;
//# sourceMappingURL=view-layout.js.map