import { given } from "@nivinjoseph/n-defensive";


export class TodoCreated
{
    private readonly _todoId: number;
    
    
    public get todoId(): number { return this._todoId; }
    
    
    public constructor(todoId: number)
    {
        given(todoId, "todoId").ensureHasValue().ensureIsNumber();
        
        this._todoId = todoId;
    }
}