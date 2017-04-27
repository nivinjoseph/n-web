import { TodoManager } from "./../../services/todo-manager/todo-manager";
import { given } from "n-defensive";
import { httpDelete, route, Controller } from "./../../../src/index";
import * as Routes from "./../routes";
import { inject } from "n-ject";

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

