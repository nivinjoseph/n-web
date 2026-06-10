import { given } from "@nivinjoseph/n-defensive";
import type {
    CommandControllerRequestBody,
    CommandControllerResponseBody,
    QueryControllerResponseBody
} from "./../../src/index.js";
// type-only imports: the SDK derives its contract purely from the controller types and
// has no runtime dependency on the server-side controller implementations.
import type { CreateTodoController } from "./../controllers/api/create-todo-controller.js";
import type { GetTodoController } from "./../controllers/api/get-todo-controller.js";
import type { GetTodosController } from "./../controllers/api/get-todos-controller.js";


// Request/response contracts extracted directly from the controllers via the n-web utility types.
// If a controller's TReqBody/TResBody changes, these (and the SDK method signatures) update automatically.
export type GetTodoRes = QueryControllerResponseBody<GetTodoController>;
export type GetTodosRes = QueryControllerResponseBody<GetTodosController>;
export type CreateTodoReq = CommandControllerRequestBody<CreateTodoController>;
export type CreateTodoRes = CommandControllerResponseBody<CreateTodoController>;


export class TodoSdk
{
    private readonly _baseUrl: string;


    public constructor(baseUrl: string)
    {
        given(baseUrl, "baseUrl").ensureHasValue().ensureIsString();
        this._baseUrl = baseUrl.trim().replace(/\/+$/, "");
    }


    public async getTodos(search?: string): Promise<GetTodosRes>
    {
        const url = new URL(`${this._baseUrl}/api/Todos`);
        if (search != null)
            url.searchParams.set("$search", search);

        return this._get<GetTodosRes>(url.toString());
    }

    public async getTodo(id: number): Promise<GetTodoRes>
    {
        given(id, "id").ensureHasValue().ensureIsNumber();

        return this._get<GetTodoRes>(`${this._baseUrl}/api/Todo/${id}`);
    }

    public async createTodo(body: CreateTodoReq): Promise<CreateTodoRes>
    {
        given(body, "body").ensureHasValue().ensureIsObject();

        return this._post<CreateTodoRes>(`${this._baseUrl}/api/CreateTodo`, body);
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



