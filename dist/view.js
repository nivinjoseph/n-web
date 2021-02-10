"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.view = exports.viewSymbol = void 0;
require("reflect-metadata");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
require("@nivinjoseph/n-ext");
exports.viewSymbol = Symbol("webView");
// public
function view(file) {
    n_defensive_1.given(file, "file")
        .ensureHasValue()
        .ensure(t => !t.isEmptyOrWhiteSpace());
    return (target) => Reflect.defineMetadata(exports.viewSymbol, file.trim(), target);
}
exports.view = view;
//# sourceMappingURL=view.js.map