import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { Controller, httpDelete, route } from "./../../../src/index.js";
import { type TodoManager } from "./../../services/todo-manager/todo-manager.js";
import * as Routes from "./../routes.js";

@httpDelete
@route(Routes.deleteTodo)   
@inject("TodoManager")    
export class DeleteTodoController extends Controller
{
    private readonly _todoManager: TodoManager;
    
    
    public constructor(todoManager: TodoManager)
    {
        given(todoManager, "todoManager").ensureHasValue();
        super();
        this._todoManager = todoManager;
    }
    
    
    public execute(id: number): Promise<void>
    {
        return this._todoManager.deleteTodo(id);
    }
}

