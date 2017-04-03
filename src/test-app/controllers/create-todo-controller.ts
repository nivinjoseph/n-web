import { TodoManager } from "./../services/todo-manager";
import { given } from "n-defensive";
import { Todo } from "./../models/todo";
import { httpPost, httpRoute, Controller } from "./../../index";

@httpPost
@httpRoute("/api/CreateTodo")
export class CreateTodoController extends Controller
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