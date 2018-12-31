import { EventBus } from "../event-bus";
import { EdaEvent } from "../eda-event";
import { given } from "@nivinjoseph/n-defensive";

export class InMemoryEventBus implements EventBus
{
    private _onPublish: (e: EdaEvent) => void;
    
    
    public async publish(event: EdaEvent): Promise<void>
    {
        given(event, "event").ensureHasValue()
            .ensureHasStructure({
                id: "string",
                name: "string",
            });   
        
        given(this, "this").ensure(t => !!t._onPublish, "onPublish callback has not been registered");
        
        this._onPublish(event);
    }
    
    public onPublish(callback: (e: EdaEvent) => void): void
    {
        given(callback, "callback").ensureHasValue().ensureIsFunction();
        given(this, "this").ensure(t => !t._onPublish, "setting onPublish callback more than once");
        
        this._onPublish = callback;
    }
}