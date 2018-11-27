import "@nivinjoseph/n-ext";
export declare class EventHandlerRegistration {
    private readonly _eventTypeName;
    private readonly _eventHandlerTypeName;
    private readonly _eventHandlerType;
    readonly eventTypeName: string;
    readonly eventHandlerTypeName: string;
    readonly eventHandlerType: Function;
    constructor(eventHandlerType: Function);
}
