import { given } from "@nivinjoseph/n-defensive";
// Utils comes from the client-only entry point: just lightweight url generation, never the full
// server framework (WebApp, koa, DI, controllers).
import { Utils } from "./../../src/index.client.js";
// The Routes table (runtime, for url generation) and all derived contract types (type-only) come
// from the single controllers/sdk.ts contract module.
import {
    Routes,
    type CreateTodoReq, type CreateTodoRes, type GetTodoParams, type GetTodoRes, type GetTodosParams, type GetTodosRes
} from "../controllers/sdk-contract.js";


// Re-exported so that consumers of the SDK can pull the contract types from a single place.
export type { CreateTodoReq, CreateTodoRes, GetTodoParams, GetTodoRes, GetTodosParams, GetTodosRes };


export class TodoSdk
{
    private readonly _baseUrl: string;


    public constructor(baseUrl: string)
    {
        given(baseUrl, "baseUrl").ensureHasValue().ensureIsString();
        this._baseUrl = baseUrl.trim().replace(/\/+$/, "");
    }


    public async getTodos(params?: GetTodosParams): Promise<GetTodosRes>
    {
        // params is typed from the route: { $search?: string | null; $pageNumber?: number | null; $pageSize?: number | null }
        const url = Utils.generateUrl(Routes.query.getTodos, params ?? {}, this._baseUrl);

        return this._get<GetTodosRes>(url);
    }

    public async getTodo(params: GetTodoParams): Promise<GetTodoRes>
    {
        // params is typed from the route: { id: number }
        given(params, "params").ensureHasValue().ensureIsObject();

        const url = Utils.generateUrl(Routes.query.getTodo, params, this._baseUrl);

        return this._get<GetTodoRes>(url);
    }

    public async createTodo(body: CreateTodoReq): Promise<CreateTodoRes>
    {
        given(body, "body").ensureHasValue().ensureIsObject();

        const url = Utils.generateUrl(Routes.command.createTodo, undefined, this._baseUrl);

        return this._post<CreateTodoRes>(url, body);
    }


    private async _get<T>(url: string): Promise<T>
    {
        const response = await fetch(url, { method: "GET", headers: { accept: "application/json" } });
        if (!response.ok)
            throw new Error(`GET ${url} failed with status ${response.status}.`);

        return await response.json() as T;
    }

    private async _post<T>(url: string, body: unknown): Promise<T>
    {
        const response = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json", "accept": "application/json" },
            body: JSON.stringify(body)
        });
        if (!response.ok)
            throw new Error(`POST ${url} failed with status ${response.status}.`);

        return await response.json() as T;
    }
}
