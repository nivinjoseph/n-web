import { EventBus } from "./event-bus";
import { EventHandler } from "./event-handler";
import { given } from "@nivinjoseph/n-defensive";
import { BackgroundProcessor } from "@nivinjoseph/n-util";


export class DefaultEventBus implements EventBus
{
    private readonly _subscriptions: { [index: string]: Array<EventHandler<any>> } = {};
    private _processor: BackgroundProcessor;
    
    
    public useProcessor(processor: BackgroundProcessor): void
    {
        given(processor, "processor").ensureHasValue().ensureIsType(BackgroundProcessor);
        this._processor = processor;
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
    
    public subscribe(eventTypeName: string, handler: EventHandler<any>): void
    {
        given(eventTypeName, "eventTypeName").ensureHasValue().ensureIsString();
        given(handler, "handler").ensureHasValue().ensureIsObject();

        eventTypeName = eventTypeName.trim();

        if (!this._subscriptions[eventTypeName])
            this._subscriptions[eventTypeName] = new Array<EventHandler<any>>();

        const eventHandlers = this._subscriptions[eventTypeName];
        eventHandlers.push(handler);
    }
}