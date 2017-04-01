import { TodoManager } from "./../services/todo-manager";
import given from "n-defensive";
import { Todo } from "./../models/todo";
import { Controller } from "./../../core/controller";
import { httpPut } from "./../../core/http-method";
import { httpRoute } from "./../../core/http-route";

@httpPut
@httpRoute("/api/UpdateTodo")    
export class UpdateTodoController extends Controller<Model, Todo>
{
    private readonly _todoManager: TodoManager;
    
    
    public constructor(todoManager: TodoManager)
    {
        given(todoManager, "todoManager").ensureHasValue();
        super();
        this._todoManager = todoManager;
    }
    
    
    public execute(model: Model): Promise<Todo>
    {
        return this._todoManager.updateTodo(model.id, model.title, model.description);
    }
}

interface Model
{
    id: number;
    title: string;
    description: string;
}