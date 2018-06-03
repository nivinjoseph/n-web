import "@nivinjoseph/n-ext";
export declare class EventHandlerRegistration {
    private readonly _eventName;
    private readonly _eventHandlerName;
    private readonly _eventHandler;
    readonly eventName: string;
    readonly eventHandlerName: string;
    readonly eventHandler: Function;
    constructor(eventHandler: Function);
}
