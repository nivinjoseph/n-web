import { Todo } from "./../models/todo";
import { given } from "n-defensive";
import { TodoManager } from "./../services/todo-manager";
import { httpGet, httpRoute, Controller } from "./../../index";

@httpGet
@httpRoute("/api/Todos")    
export class GetTodosController extends Controller
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