"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewLayout = exports.viewLayoutSymbol = void 0;
require("reflect-metadata");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
require("@nivinjoseph/n-ext");
exports.viewLayoutSymbol = Symbol("viewLayout");
// public
function viewLayout(file) {
    (0, n_defensive_1.given)(file, "file")
        .ensureHasValue()
        .ensure(t => !t.isEmptyOrWhiteSpace());
    return (target) => Reflect.defineMetadata(exports.viewLayoutSymbol, file.trim(), target);
}
exports.viewLayout = viewLayout;
//# sourceMappingURL=view-layout.js.map