import { given } from "n-defensive";
import { TodoManager } from "./../../services/todo-manager/todo-manager";
import { httpGet, route, Controller, authorize } from "./../../../src/index";
import * as Routes from "./../routes";
import { ConfigService } from "./../../services/config-service/config-service";
import { inject } from "n-ject";
import * as AppClaims from "./../../security/app-claims";

@httpGet
@route(Routes.getTodos)
@authorize(AppClaims.claim1)    
@inject("TodoManager", "ConfigService")    
export class GetTodosController extends Controller
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
    
    
    public async execute(): Promise<object>
    {       
        let todos = await this._todoManager.getTodos();
        let baseUrl = await this._configService.getBaseUrl();
        return {
            items: todos.map(t =>
            {
                return {
                    id: t.id,
                    title: t.title,
                    links: {
                        self: this.generateUrl(Routes.getTodo, { id: t.id }, baseUrl)
                    }
                };
            }),
            links: {
                create: this.generateUrl(Routes.createTodo, null, baseUrl)
            }
        };
    }
}