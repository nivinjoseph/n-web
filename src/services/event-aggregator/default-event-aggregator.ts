import { EventAggregator } from "./event-aggregator";
import { EventHandler } from "./event-handler";
import { given } from "@nivinjoseph/n-defensive";


export class DefaultEventAggregator implements EventAggregator
{
    private _subscriptions: { [index: string]: Array<EventHandler> } = {};
    
    
    public async publish(event: string, ...eventArgs: any[]): Promise<void>
    {
        given(event, "event").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());

        event = event.trim();

        if (!this._subscriptions[event])
            return;
        
        const eventHandlers = this._subscriptions[event];
        await Promise.all(eventHandlers.map(t => t.handle(...eventArgs)));
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
}