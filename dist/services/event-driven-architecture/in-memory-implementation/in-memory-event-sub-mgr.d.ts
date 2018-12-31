import { EventSubMgr } from "../event-sub-mgr";
import { Container } from "@nivinjoseph/n-ject";
import { EventMap } from "../event-map";
import { EventBus } from "../event-bus";
import { BackgroundProcessor } from "@nivinjoseph/n-util";
export declare class InMemoryEventSubMgr implements EventSubMgr {
    private readonly _processor;
    constructor(processor: BackgroundProcessor);
    initialize(container: Container, eventMap: EventMap, eventBus: EventBus): void;
}
