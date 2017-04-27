import { TodoManager } from "./todo-manager";
import { Todo } from "./../../models/todo";
import "n-ext";
import { ApplicationException } from "n-exception";
import { given } from "n-defensive";
import { Logger } from "./../logger/logger";
import { inject } from "n-ject";

@inject("Logger")
export class InmemoryTodoManager implements TodoManager
{
    private readonly _todos: Array<Todo> = [];
    private readonly _logger: Logger;
    
    
    public constructor(logger: Logger)
    {
        given(logger, "logger").ensureHasValue();
        this._logger = logger;
    }
    
    
    public async getTodos(): Promise<Todo[]>
    {
        await this._logger.logInfo("Getting TODOs");
        return this._todos.map(t => t);
    }
    
    public async addTodo(title: string, description: string): Promise<Todo>
    {
        given(title, "title").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        let lastId = this._todos.length === 0 ? 0 : this._todos.orderByDesc(t => t.id)[0].id;
        let todo = new Todo(lastId + 1, title, description);
        this._todos.push(todo);
        await this._logger.logInfo(`Added TODO with id ${todo.id}`);
        return todo;
    }
    
    public async updateTodo(id: number, title: string, description: string): Promise<Todo>
    {
        given(id, "id").ensureHasValue().ensure(t => t > 0);
        given(title, "title").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        let todo = this._todos.find(t => t.id === id);
        if (todo == null)
            throw new ApplicationException("Todo with id {0} not found.".format(id));
        
        this._todos.remove(todo);
        todo = new Todo(todo.id, title, description);
        this._todos.push(todo);
        await this._logger.logInfo(`Updated TODO with id ${todo.id}`);
        return todo;
    }
    
    public async deleteTodo(id: number): Promise<void>
    {
        given(id, "id").ensureHasValue();
        
        let todo = this._todos.find(t => t.id === id);
        if (todo == null)
        {
            await this._logger.logError(`Attempted to delete non existent TODO with id ${id}.`);
            return;
        }
        
        this._todos.remove(todo);
        await this._logger.logWarning(`TODO with id ${id} deleted.`);
    }
}