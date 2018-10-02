"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
require("@nivinjoseph/n-ext");
exports.eventSymbol = Symbol("eventName");
function event(event) {
    n_defensive_1.given(event, "event").ensureHasValue()
        .ensure(t => !t.isEmptyOrWhiteSpace(), "cannot be empty or whitespace");
    return (target) => Reflect.defineMetadata(exports.eventSymbol, event.trim(), target);
}
exports.event = event;
//# sourceMappingURL=event.js.map