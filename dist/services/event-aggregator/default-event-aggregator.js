"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("@nivinjoseph/n-defensive");
class DefaultEventAggregator {
    constructor() {
        this._subscriptions = {};
    }
    publish(event, ...eventArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            n_defensive_1.given(event, "event").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
            event = event.trim();
            if (!this._subscriptions[event])
                return;
            const eventHandlers = this._subscriptions[event];
            yield Promise.all(eventHandlers.map(t => t.handle(...eventArgs)));
        });
    }
    subscribe(event, handler) {
        n_defensive_1.given(event, "event").ensureHasValue();
        n_defensive_1.given(handler, "handler").ensureHasValue().ensureIsObject();
        event = event.trim();
        if (!this._subscriptions[event])
            this._subscriptions[event] = new Array();
        const eventHandlers = this._subscriptions[event];
        eventHandlers.push(handler);
    }
}
exports.DefaultEventAggregator = DefaultEventAggregator;
//# sourceMappingURL=default-event-aggregator.js.map