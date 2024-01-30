import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { Controller, Utils, query, route } from "./../../../src/index.js";
import { TodoNotFoundException } from "./../../exceptions/todo-not-found-exception.js";
import { type ConfigService } from "./../../services/config-service/config-service.js";
import { type TodoManager } from "./../../services/todo-manager/todo-manager.js";
import * as Routes from "./../routes.js";

@query
@route(Routes.getTodo)  
@inject("TodoManager", "ConfigService")    
export class GetTodoController extends Controller
{
    private readonly _todoManager: TodoManager;
    private readonly _configService: ConfigService;
    
    
    public constructor(todoManager: TodoManager, configService: ConfigService)
    {
        given(todoManager, "todoManager").ensureHasValue();
        given(configService, "configService").ensureHasValue();
        super();
        this._todoManager = todoManager;
        this._configService = configService;
    }
    
    
    public async execute(id: number): Promise<any>
    {
        const todos = await this._todoManager.getTodos();
        const todo = todos.find(t => t.id === id);
        if (todo == null)
            throw new TodoNotFoundException(id);
        
        const baseUrl = await this._configService.getBaseUrl();
        return {
            id: todo.id,
            title: todo.title,
            description: todo.description,
            links: {
                self: Utils.generateUrl(Routes.getTodo, { id: todo.id }, baseUrl),
                update: Utils.generateUrl(Routes.updateTodo, { id: todo.id }, baseUrl),
                delete: Utils.generateUrl(Routes.deleteTodo, { id: todo.id }, baseUrl)
            }
        };
    }
}