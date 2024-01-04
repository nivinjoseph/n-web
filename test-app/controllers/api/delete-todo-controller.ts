import { TodoManager } from "./../../services/todo-manager/todo-manager.js";
import { given } from "@nivinjoseph/n-defensive";
import { httpDelete, route, Controller } from "./../../../src/index.js";
import * as Routes from "./../routes.js";
import { inject } from "@nivinjoseph/n-ject";

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

