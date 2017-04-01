import { Controller } from "./../../core/controller";
import given from "n-defensive";
import { Todo } from "./../models/todo";
import { TodoManager } from "./../services/todo-manager";
import { httpGet } from "./../../core/http-method";
import { httpRoute } from "./../../core/http-route";

@httpGet
@httpRoute("/api/Todo/:id")    
export class GetTodoController extends Controller<Model, Todo>
{
    private readonly _todoManager: TodoManager;
    
    
    public constructor(todoManager: TodoManager)
    {
        given(todoManager, "todoManager").ensureHasValue();
        super();
        this._todoManager = todoManager;
    }
    
    
    public async execute(model: Model): Promise<any>
    {
        let todos = await this._todoManager.getTodos();
        console.log("model", model);
        let todo = todos.find(t => t.id === Number.parseInt(model.id));
        console.log("todo", todo);
        return {
            id: todo.id,
            title: todo.title,
            description: todo.description
        };
    }
}

interface Model
{
    id: string;
}