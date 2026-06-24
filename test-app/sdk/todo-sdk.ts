import { given } from "@nivinjoseph/n-defensive";
// RpcClient (and everything else the SDK needs) comes from the client-only entry point — never the
// full server framework (WebApp, koa, DI, controllers).
import { RpcClient } from "./../../src/index.client.js";
// The Routes table (runtime) and all derived contract types — including the endpoint contracts that
// parameterize each RpcClient call — come from the single sdk-contract.ts module.
import {
    Routes,
    type CreateTodoEndpoint, type CreateTodoReq, type CreateTodoRes,
    type GetTodoEndpoint, type GetTodoParams, type GetTodoRes,
    type GetTodosEndpoint, type GetTodosParams, type GetTodosRes
} from "../controllers/sdk-contract.js";
import { TodoProxy } from "./todo-proxy.js";


// Re-exported so that consumers of the SDK can pull the contract types from a single place.
export type { CreateTodoReq, CreateTodoRes, GetTodoParams, GetTodoRes, GetTodosParams, GetTodosRes };
export { TodoProxy };


export class TodoSdk
{
    private readonly _rpcClient: RpcClient;


    public constructor(baseUrl: string)
    {
        given(baseUrl, "baseUrl").ensureHasValue().ensureIsString();
        this._rpcClient = new RpcClient(baseUrl);
    }


    public async getTodos(params?: GetTodosParams): Promise<Array<TodoProxy>>
    {
        // the list endpoint returns summaries (id, title, self); fetch each todo in full and hand
        // back a live, observable proxy per item
        const list = await this._rpcClient.query<GetTodosEndpoint>(Routes.query.getTodos, params ?? {});
        return Promise.all(list.items.map(item => this.getTodo({ id: item.id })));
    }

    public async getTodo(params: GetTodoParams): Promise<TodoProxy>
    {
        given(params, "params").ensureHasValue().ensureIsObject();

        // fetch the DTO once, then hand back a live, observable proxy that can refresh itself by id
        const dto = await this._rpcClient.query<GetTodoEndpoint>(Routes.query.getTodo, params);
        return new TodoProxy(this._rpcClient, params.id, dto);
    }

    public async createTodo(body: CreateTodoReq): Promise<TodoProxy>
    {
        given(body, "body").ensureHasValue().ensureIsObject();

        // create, then hand back a live proxy seeded with the created todo
        const dto = await this._rpcClient.command<CreateTodoEndpoint>(Routes.command.createTodo, body);
        return new TodoProxy(this._rpcClient, dto.id, dto);
    }
}
