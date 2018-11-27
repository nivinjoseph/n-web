"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const event_1 = require("./event");
const n_exception_1 = require("@nivinjoseph/n-exception");
require("@nivinjoseph/n-ext");
class EventHandlerRegistration {
    get eventTypeName() { return this._eventTypeName; }
    get eventHandlerTypeName() { return this._eventHandlerTypeName; }
    get eventHandlerType() { return this._eventHandlerType; }
    constructor(eventHandlerType) {
        n_defensive_1.given(eventHandlerType, "eventHandlerType").ensureHasValue().ensureIsFunction();
        this._eventHandlerTypeName = eventHandlerType.getTypeName();
        this._eventHandlerType = eventHandlerType;
        if (!Reflect.hasOwnMetadata(event_1.eventSymbol, this._eventHandlerType))
            throw new n_exception_1.ApplicationException("EventHandler '{0}' does not have event applied."
                .format(this._eventHandlerTypeName));
        this._eventTypeName = Reflect.getOwnMetadata(event_1.eventSymbol, this._eventHandlerType);
    }
}
exports.EventHandlerRegistration = EventHandlerRegistration;
//# sourceMappingURL=event-handler-registration.js.map