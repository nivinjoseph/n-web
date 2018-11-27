import { given } from "@nivinjoseph/n-defensive";
import { eventSymbol } from "./event";
import { ApplicationException } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";


export class EventHandlerRegistration
{
    private readonly _eventTypeName: string;
    private readonly _eventHandlerTypeName: string;
    private readonly _eventHandlerType: Function;
    
    
    public get eventTypeName(): string { return this._eventTypeName; }
    public get eventHandlerTypeName(): string { return this._eventHandlerTypeName; }
    public get eventHandlerType(): Function { return this._eventHandlerType; }
    
    
    public constructor(eventHandlerType: Function)
    {
        given(eventHandlerType, "eventHandlerType").ensureHasValue().ensureIsFunction();

        this._eventHandlerTypeName = (<Object>eventHandlerType).getTypeName();
        this._eventHandlerType = eventHandlerType;
        
        if (!Reflect.hasOwnMetadata(eventSymbol, this._eventHandlerType))
            throw new ApplicationException("EventHandler '{0}' does not have event applied."
                .format(this._eventHandlerTypeName));
        
        this._eventTypeName = Reflect.getOwnMetadata(eventSymbol, this._eventHandlerType);
    }
}