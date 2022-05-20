import { TodoManager } from "./todo-manager";
import { Todo } from "./../../models/todo";
import "@nivinjoseph/n-ext";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { Logger } from "@nivinjoseph/n-log";


@inject("Logger")
export class InmemoryTodoManager implements TodoManager
{
    private readonly _todos: Array<Todo> = [];
    private readonly _logger: Logger;
    
    
    public constructor(logger: Logger)
    {
        given(logger, "logger").ensureHasValue();
        this._logger = logger;
        
        this._initializeTodos();
    }
    
    
    public async getTodos(): Promise<Array<Todo>>
    {
        await this._logger.logInfo(`Getting TODOs ${this._todos.length}`);
        return this._todos.map(t => t);
    }
    
    public async addTodo(title: string, description: string): Promise<Todo>
    {
        given(title, "title").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        const lastId = this._todos.length === 0 ? 0 : this._todos.orderByDesc(t => t.id)[0].id;
        const todo = new Todo(lastId + 1, title, description);
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
        
        const todo = this._todos.find(t => t.id === id);
        if (todo == null)
        {
            await this._logger.logError(`Attempted to delete non existent TODO with id ${id}.`);
            return;
        }
        
        this._todos.remove(todo);
        await this._logger.logWarning(`TODO with id ${id} deleted.`);
    }
    
    private _initializeTodos(): void
    {
        for (let i = 0; i < 1000; i++)
        {
            this._todos.push(new Todo(i, `Todo # ${i}`, `I am Todo number ${i}.`));
        }
    }
}