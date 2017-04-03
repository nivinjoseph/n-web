import { given } from "n-defensive";
import { Todo } from "./../models/todo";
import { TodoManager } from "./../services/todo-manager";
import { httpGet, httpRoute, Controller } from "./../../index";

@httpGet
@httpRoute("/api/Todo/{id: number}/{text: string}?{query1?: number}&{query2:boolean}")    
export class GetTodoController extends Controller
{
    private readonly _todoManager: TodoManager;
    
    
    public constructor(todoManager: TodoManager)
    {
        given(todoManager, "todoManager").ensureHasValue();
        super();
        this._todoManager = todoManager;
    }
    
    public async execute(id: number, text: string, query1: number, query2: boolean): Promise<any>
    {
        console.log("id", id);
        console.log("text", text);
        console.log("query1", query1);
        console.log("query2", query2);
        
        let todos = await this._todoManager.getTodos();
        let todo = todos.find(t => t.id === id);
        return {
            id: todo.id,
            title: todo.title,
            description: todo.description
        };
    }
    
    
    // public async execute(id: number): Promise<any>
    // {
    //     let todos = await this._todoManager.getTodos();
    //     console.log("model", id);
    //     let todo = todos.find(t => t.id === id);
    //     console.log("todo", todo);
    //     return {
    //         id: todo.id,
    //         title: todo.title,
    //         description: todo.description
    //     };
    // }
    
    
}