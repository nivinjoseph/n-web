// export const getTodos = "/api/Todos?{$search?: string}&{$pageNumber?: number}&{$pageSize?: number}";
// export const getTodo = "/api/Todo/{id: number}";
// export const createTodo = "/api/CreateTodo";
// export const updateTodo = "/api/UpdateTodo/{id: number}";
// export const deleteTodo = "/api/DeleteTodo/{id: number}";

// export const home = "/";
// export const homeWithLayout = "/HomeWithLayout";


/** biome-ignore-all lint/complexity/noStaticOnlyClass: architect choice */
export class Routes
{
    private static readonly _queryPrefix = "/api/query";
    private static readonly _commandPrefix = "/api/command";

    // `as const` keeps each route as its exact string-literal type (instead of being widened
    // to `string`), which is what lets RouteParams<typeof Routes.query.getTodo> parse it.
    public static readonly query = {
        version: `${Routes._queryPrefix}/version`,

        getTodos: `${Routes._queryPrefix}/todos?{$search?: string}&{$pageNumber?: number}&{$pageSize?: number}`,
        getTodo: `${Routes._queryPrefix}/todo/{id: number}`,
    } as const;

    public static readonly command = {
        createTodo: `${Routes._commandPrefix}/createTodo`,
        updateTodo: `${Routes._commandPrefix}/updateTodo/{id: number}`,
        deleteTodo: `${Routes._commandPrefix}/DeleteTodo/{id: number}`
    } as const;

    public static readonly ui = {
        home: "/",
        homeWithLayout: "/homeWithLayout"
    } as const;
}