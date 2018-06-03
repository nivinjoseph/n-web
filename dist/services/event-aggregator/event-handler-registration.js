"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const event_1 = require("./event");
const n_exception_1 = require("@nivinjoseph/n-exception");
require("@nivinjoseph/n-ext");
class EventHandlerRegistration {
    get eventName() { return this._eventName; }
    get eventHandlerName() { return this._eventHandlerName; }
    get eventHandler() { return this._eventHandler; }
    constructor(eventHandler) {
        n_defensive_1.given(eventHandler, "controller").ensureHasValue().ensureIsFunction();
        this._eventHandlerName = eventHandler.getTypeName();
        this._eventHandler = eventHandler;
        if (!Reflect.hasOwnMetadata(event_1.eventSymbol, this._eventHandler))
            throw new n_exception_1.ApplicationException("EventHandler '{0}' does not have event applied."
                .format(this._eventHandlerName));
        this._eventName = Reflect.getOwnMetadata(event_1.eventSymbol, this._eventHandler);
    }
}
exports.EventHandlerRegistration = EventHandlerRegistration;
//# sourceMappingURL=event-handler-registration.js.map