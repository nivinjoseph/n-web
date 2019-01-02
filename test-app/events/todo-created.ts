import { given } from "@nivinjoseph/n-defensive";
import { EdaEvent } from "@nivinjoseph/n-eda";


export class TodoCreated implements EdaEvent
{
    private readonly _todoId: number;
    
    
    public get todoId(): number { return this._todoId; }
    public get id(): string { return this._todoId.toString(); }
    public get name(): string { return (<Object>this).getTypeName(); }
    
    
    public constructor(todoId: number)
    {
        given(todoId, "todoId").ensureHasValue().ensureIsNumber();
        
        this._todoId = todoId;
    }
}