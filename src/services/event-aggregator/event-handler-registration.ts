import { given } from "@nivinjoseph/n-defensive";
import { eventSymbol } from "./event";
import { ApplicationException } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";


export class EventHandlerRegistration
{
    private readonly _eventName: string;
    private readonly _eventHandlerName: string;
    private readonly _eventHandler: Function;
    
    
    public get eventName(): string { return this._eventName; }
    public get eventHandlerName(): string { return this._eventHandlerName; }
    public get eventHandler(): Function { return this._eventHandler; }
    
    
    public constructor(eventHandler: Function)
    {
        given(eventHandler, "controller").ensureHasValue().ensureIsFunction();

        this._eventHandlerName = (<Object>eventHandler).getTypeName();
        this._eventHandler = eventHandler;
        
        if (!Reflect.hasOwnMetadata(eventSymbol, this._eventHandler))
            throw new ApplicationException("EventHandler '{0}' does not have event applied."
                .format(this._eventHandlerName));
        
        this._eventName = Reflect.getOwnMetadata(eventSymbol, this._eventHandler);
    }
}