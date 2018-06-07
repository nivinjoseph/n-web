import { EventAggregator } from "./event-aggregator";
import { EventHandler } from "./event-handler";
import { given } from "@nivinjoseph/n-defensive";
import { BackgroundProcessor } from "@nivinjoseph/n-util";


export class DefaultEventAggregator implements EventAggregator
{
    private readonly _subscriptions: { [index: string]: Array<EventHandler> } = {};
    private _processor: BackgroundProcessor;
    
    
    public useProcessor(processor: BackgroundProcessor): void
    {
        given(processor, "processor").ensureHasValue().ensureIsType(BackgroundProcessor);
        this._processor = processor;
    }
    
    public subscribe(event: string, handler: EventHandler): void
    {
        given(event, "event").ensureHasValue();
        given(handler, "handler").ensureHasValue().ensureIsObject();

        event = event.trim();

        if (!this._subscriptions[event])
            this._subscriptions[event] = new Array<EventHandler>();

        const eventHandlers = this._subscriptions[event];
        eventHandlers.push(handler);
    }
    
    public async publish(event: string, ...eventArgs: any[]): Promise<void>
    {
        given(event, "event").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());

        event = event.trim();

        if (!this._subscriptions[event])
            return;
        
        const eventHandlers = this._subscriptions[event];
        eventHandlers.forEach(t => this._processor.processAction(() => t.handle(...eventArgs)));
    }
}