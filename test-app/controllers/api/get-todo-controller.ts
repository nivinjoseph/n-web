import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { QueryController, Utils, route } from "./../../../src/index.js";
import { TodoNotFoundException } from "./../../exceptions/todo-not-found-exception.js";
import { type ConfigService } from "./../../services/config-service/config-service.js";
import { type TodoManager } from "./../../services/todo-manager/todo-manager.js";
import {Routes} from "./../routes.js";

// the GET http method is inherited from QueryController
@route(Routes.query.getTodo)
@inject("TodoManager", "ConfigService")
export class GetTodoController extends QueryController<TodoResponse, typeof Routes.query.getTodo>
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
    
    
    public override async execute(id: number): Promise<TodoResponse>
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
                self: Utils.generateUrl(Routes.query.getTodo, { id: todo.id }, baseUrl),
                update: Utils.generateUrl(Routes.command.updateTodo, { id: todo.id }, baseUrl),
                delete: Utils.generateUrl(Routes.command.deleteTodo, { id: todo.id }, baseUrl)
            }
        };
    }
}

export interface TodoResponse
{
    id: number;
    title: string;
    description: string;
    links: {
        self: string;
        update: string;
        delete: string;
    };
}