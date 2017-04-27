import { given } from "n-defensive";
import { TodoManager } from "./../../services/todo-manager/todo-manager";
import { query, httpGet, route, Controller } from "./../../../src/index";
import * as Routes from "./../routes";
import { TodoNotFoundException } from "./../../exceptions/todo-not-found-exception";
import { ConfigService } from "./../../services/config-service/config-service";
import { inject } from "n-ject";

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
        let todos = await this._todoManager.getTodos();
        let todo = todos.find(t => t.id === id);
        if (todo == null)
            throw new TodoNotFoundException(id);
        
        let baseUrl = await this._configService.getBaseUrl();
        return {
            id: todo.id,
            title: todo.title,
            description: todo.description,
            links: {
                self: this.generateUrl(Routes.getTodo, { id: todo.id }, baseUrl),
                update: this.generateUrl(Routes.updateTodo, { id: todo.id }, baseUrl),
                delete: this.generateUrl(Routes.deleteTodo, { id: todo.id }, baseUrl)
            }
        };
    }
}