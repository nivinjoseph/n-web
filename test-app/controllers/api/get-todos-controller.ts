import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { QueryController, Utils, route, type CallContext } from "./../../../src/index.js";
import { type ConfigService } from "./../../services/config-service/config-service.js";
import { type TodoManager } from "./../../services/todo-manager/todo-manager.js";
import {Routes} from "./../routes.js";

// the GET http method is inherited from QueryController
@route(Routes.query.getTodos)
// @route("/*")
// @authorize(AppClaims.claim1)
@inject("TodoManager", "ConfigService", "CallContext")
export class GetTodosController extends QueryController<TodoListResponse>
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

    public override async execute($search?: string, _$pageNumber?: number, _$pageSize?: number): Promise<TodoListResponse>
    {
        // if (!$search)
        //     throw new ApplicationException("this is a test1");

        // this.disableCompression();


        console.log("query", this._callContext.queryParams);
        console.log("$search", $search);


        if ($search)
        {
            console.log("do this");
        }


        const todos = await this._todoManager.getTodos();
        const baseUrl = await this._configService.getBaseUrl();

        // if (!$search)
        //     throw new HttpException(404, "this is a test");

        return {
            items: todos.map(t =>
            {
                return {
                    id: t.id,
                    title: t.title,
                    links: {
                        self: Utils.generateUrl(Routes.query.getTodo, { id: t.id }, baseUrl)
                    }
                };
            }),
            links: {
                create: Utils.generateUrl(Routes.command.createTodo, undefined, baseUrl),
                test: Utils.generateUrl(Routes.query.getTodos, { $search: null, $pageNumber: 1, $pageSize: 500, productCategoryId: "abcd" }, baseUrl)
            }
        };
    }
}

export interface TodoListResponse
{
    items: Array<{
        id: number;
        title: string;
        links: {
            self: string;
        };
    }>;
    links: {
        create: string;
        test: string;
    };
}