import { TodoManager } from "./../services/todo-manager";
import given from "n-defensive";
import { Controller } from "./../../core/controller";
import { httpDelete } from "./../../core/http-method";
import { httpRoute } from "./../../core/http-route";

@httpDelete
@httpRoute("/api/DeleteTodo")    
export class DeleteTodoController extends Controller<Model, void>
{
    private readonly _todoManager: TodoManager;
    
    
    public constructor(todoManager: TodoManager)
    {
        given(todoManager, "todoManager").ensureHasValue();
        super();
        this._todoManager = todoManager;
    }
    
    
    public async execute(model: Model): Promise<void>
    {
        await this._todoManager.deleteTodo(model.id);
    }
}

interface Model
{
    id: number;
}