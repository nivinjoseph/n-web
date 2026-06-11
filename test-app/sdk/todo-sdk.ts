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


// Re-exported so that consumers of the SDK can pull the contract types from a single place.
export type { CreateTodoReq, CreateTodoRes, GetTodoParams, GetTodoRes, GetTodosParams, GetTodosRes };


export class TodoSdk
{
    private readonly _rpcClient: RpcClient;


    public constructor(baseUrl: string)
    {
        given(baseUrl, "baseUrl").ensureHasValue().ensureIsString();
        this._rpcClient = new RpcClient(baseUrl);
    }


    public getTodos(params?: GetTodosParams): Promise<GetTodosRes>
    {
        // a single endpoint generic validates the route, params, and response together
        return this._rpcClient.query<GetTodosEndpoint>(Routes.query.getTodos, params ?? {});
    }

    public getTodo(params: GetTodoParams): Promise<GetTodoRes>
    {
        given(params, "params").ensureHasValue().ensureIsObject();

        return this._rpcClient.query<GetTodoEndpoint>(Routes.query.getTodo, params);
    }

    public createTodo(body: CreateTodoReq): Promise<CreateTodoRes>
    {
        given(body, "body").ensureHasValue().ensureIsObject();

        return this._rpcClient.command<CreateTodoEndpoint>(Routes.command.createTodo, body);
    }
}
