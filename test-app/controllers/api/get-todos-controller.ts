import { given } from "n-defensive";
import { TodoManager } from "./../../services/todo-manager/todo-manager";
import { httpGet, route, Controller, authorize, CallContext, Utils } from "./../../../src/index";
import * as Routes from "./../routes";
import { ConfigService } from "./../../services/config-service/config-service";
import { inject } from "n-ject";
import * as AppClaims from "./../../security/app-claims";

@httpGet
@route(Routes.getTodos)
// @authorize(AppClaims.claim1)    
@inject("TodoManager", "ConfigService", "CallContext")    
export class GetTodosController extends Controller
{
    private readonly _todoManager: TodoManager;
    private readonly _configService: ConfigService;
    private readonly _callContext: CallContext;
    
    
    public constructor(todoManager: TodoManager, configService: ConfigService, callContext: CallContext)
    {
        given(todoManager, "todoManager").ensureHasValue();
        given(configService, "configService").ensureHasValue();
        given(callContext, "callContext").ensureHasValue();
        super();
        this._todoManager = todoManager;
        this._configService = configService;
        this._callContext = callContext;
    }
    
    
    public async execute($search?: string, $pageNumber?: number, $pageSize?: number): Promise<object>
    {       
        console.log("query", this._callContext.queryParams);
        console.log("$search", $search);
        
        
        if ($search)
        {
            console.log("do this");
        }    
        
        
        let todos = await this._todoManager.getTodos();
        let baseUrl = await this._configService.getBaseUrl();
        return {
            items: todos.map(t =>
            {
                return {
                    id: t.id,
                    title: t.title,
                    links: {
                        self: Utils.generateUrl(Routes.getTodo, { id: t.id }, baseUrl)
                    }
                };
            }),
            links: {
                create: Utils.generateUrl(Routes.createTodo, null, baseUrl),
                test: Utils.generateUrl(Routes.getTodos, {$search: null, $pageNumber: 1, $pageSize: 500, productCategoryId: "abcd"}, baseUrl)
            }
        };
    }
}