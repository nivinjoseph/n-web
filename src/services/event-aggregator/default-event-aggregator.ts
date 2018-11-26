import { EventAggregator } from "./event-aggregator";
import { EventHandler } from "./event-handler";
import { given } from "@nivinjoseph/n-defensive";
import { BackgroundProcessor } from "@nivinjoseph/n-util";


export class DefaultEventAggregator implements EventAggregator
{
    private readonly _subscriptions: { [index: string]: Array<EventHandler<any>> } = {};
    private _processor: BackgroundProcessor;
    
    
    public useProcessor(processor: BackgroundProcessor): void
    {
        given(processor, "processor").ensureHasValue().ensureIsType(BackgroundProcessor);
        this._processor = processor;
    }
    
    public subscribe(event: string, handler: EventHandler<any>): void
    {
        given(event, "event").ensureHasValue();
        given(handler, "handler").ensureHasValue().ensureIsObject();

        event = event.trim();

        if (!this._subscriptions[event])
            this._subscriptions[event] = new Array<EventHandler<any>>();

        const eventHandlers = this._subscriptions[event];
        eventHandlers.push(handler);
    }
    
    public async publish(event: object): Promise<void>
    {
        given(event, "event").ensureHasValue().ensureIsObject();

        const eventName = (<Object>event).getTypeName();

        if (!this._subscriptions[eventName])
            return;
        
        const eventHandlers = this._subscriptions[eventName];
        eventHandlers.forEach(t => this._processor.processAction(() => t.handle(event)));
    }
}