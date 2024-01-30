"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.view = exports.viewSymbol = void 0;
require("reflect-metadata");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
exports.viewSymbol = Symbol.for("@nivinjoseph/n-web/view");
// public
function view(file) {
    (0, n_defensive_1.given)(file, "file").ensureHasValue().ensureIsString();
    return (target) => Reflect.defineMetadata(exports.viewSymbol, file.trim(), target);
}
exports.view = view;
//# sourceMappingURL=view.js.map