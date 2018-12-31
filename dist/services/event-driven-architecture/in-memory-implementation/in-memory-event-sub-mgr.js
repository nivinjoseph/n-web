"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_ject_1 = require("@nivinjoseph/n-ject");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const n_util_1 = require("@nivinjoseph/n-util");
const in_memory_event_bus_1 = require("./in-memory-event-bus");
class InMemoryEventSubMgr {
    constructor(processor) {
        n_defensive_1.given(processor, "processor").ensureHasValue().ensureIsType(n_util_1.BackgroundProcessor);
        this._processor = processor;
    }
    initialize(container, eventMap, eventBus) {
        n_defensive_1.given(container, "container").ensureHasValue().ensureIsType(n_ject_1.Container);
        n_defensive_1.given(eventMap, "eventMap").ensureHasValue().ensureIsObject();
        n_defensive_1.given(eventBus, "eventBus").ensureHasValue().ensureIsType(in_memory_event_bus_1.InMemoryEventBus);
        const inMemoryEventBus = eventBus;
        inMemoryEventBus.onPublish((e) => {
            if (!eventMap[e.name])
                return;
            const scope = container.createScope();
            e.$scope = scope;
            const handler = scope.resolve(eventMap[e.name]);
            this._processor.processAction(() => handler.handle(e));
        });
    }
}
exports.InMemoryEventSubMgr = InMemoryEventSubMgr;
//# sourceMappingURL=in-memory-event-sub-mgr.js.map