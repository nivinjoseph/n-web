import { TodoManager } from "./todo-manager";
import { Todo } from "./../models/todo";
import "n-ext";
import { ApplicationException } from "n-exception";

export class InmemoryTodoManager implements TodoManager
{
    private readonly _todos: Array<Todo> = [new Todo(1, "Mine", "First ever")];
    
    
    public getTodos(): Promise<Todo[]>
    {
        return Promise.resolve(this._todos.map(t => t));
    }
    
    public addTodo(title: string, description: string): Promise<Todo>
    {
        let lastId = this._todos.length === 0 ? 0 : this._todos.orderByDesc(t => t.id)[0].id;
        let todo = new Todo(lastId + 1, title, description);
        this._todos.push(todo);
        return Promise.resolve(todo);
    }
    
    public updateTodo(id: number, title: string, description: string): Promise<Todo>
    {
        let todo = this._todos.find(t => t.id === id);
        if (todo == null) throw new ApplicationException("Todo with id {0} not found.".format(id));
        this._todos.remove(todo);
        todo = new Todo(todo.id, title, description);
        this._todos.push(todo);
        return Promise.resolve(todo);
    }
    
    public deleteTodo(id: number): Promise<void>
    {
        let todo = this._todos.find(t => t.id === id);
        if (todo == null) return Promise.resolve();
        this._todos.remove(todo);
        return Promise.resolve();
    }
}