"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const n_defensive_1 = require("n-defensive");
require("n-ext");
exports.viewSymbol = Symbol("view");
// public
function view(filePath) {
    n_defensive_1.given(filePath, "filePath").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
    return (target) => Reflect.defineMetadata(exports.viewSymbol, filePath, target);
}
exports.view = view;
//# sourceMappingURL=view.js.map