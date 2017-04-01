import { Controller } from "./../../core/controller";
import { Todo } from "./../models/todo";
import given from "n-defensive";
import { TodoManager } from "./../services/todo-manager";
import { httpGet } from "./../../core/http-method";
import { httpRoute } from "./../../core/http-route";

@httpGet
@httpRoute("/api/Todos")    
export class GetTodosController extends Controller<void, object[]>
{
    private readonly _todoManager: TodoManager;
    
    
    public constructor(todoManager: TodoManager)
    {
        given(todoManager, "todoManager").ensureHasValue();
        super();
        this._todoManager = todoManager;
    }
    
    
    public async execute(): Promise<object>
    {
        let todos = await this._todoManager.getTodos();
        return todos.map(t =>
        {
            return {
                id: t.id,
                title: t.title
            };
        });
    }
}