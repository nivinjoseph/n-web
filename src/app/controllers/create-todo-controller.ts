import { TodoManager } from "./../services/todo-manager";
import given from "n-defensive";
import { Todo } from "./../models/todo";
import { Controller } from "./../../core/controller";
import { httpPost } from "./../../core/http-method"; 
import { httpRoute } from "./../../core/http-route";

@httpPost
@httpRoute("/api/CreateTodo")
export class CreateTodoController extends Controller<Model, Todo>
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
        return this._todoManager.addTodo(model.title, model.description);
    }
}

interface Model
{
    title: string;
    description: string;
}