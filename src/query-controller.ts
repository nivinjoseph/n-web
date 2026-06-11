import { Controller } from "./controller.js";
import { query } from "./query.js";
import type { ControllerRouteParams } from "./route-params.js";

// public
@query
export abstract class QueryController<TResBody> extends Controller
{
    public abstract override execute(...params: Array<any>): Promise<TResBody>;
}

// public
// Extracts the response body type (TResBody) from a concrete QueryController subclass,
// given either the class (constructor) or an instance type.
export type QueryControllerResponseBody<T> =
    T extends abstract new (...args: Array<any>) => infer TInstance
        ? TInstance extends QueryController<infer TResBody> ? TResBody : never
        : T extends QueryController<infer TResBody> ? TResBody : never;

/**
 * Endpoint contract for a query (read) operation. Bundles a route literal with the concrete
 * `QueryController` that serves it, so a single endpoint type is the only generic a client needs to
 * pass (e.g. to an `RpcClient.query`) — the route, its resolved params, and the response body are
 * all validated together against the server. The response body is derived from the controller via
 * {@link QueryControllerResponseBody}, so it can never drift from what the controller returns.
 *
 * @example
 * type GetTodo = QueryEndpoint<typeof Routes.query.getTodo, GetTodoController>;
 *   // route: "/api/.../{id: number}"; params: { id: number }; res: <GetTodoController's response body>
 */
export type QueryEndpoint<
    TRoute extends string,
    TController extends QueryController<any> | (abstract new (...args: Array<any>) => QueryController<any>)
> = {
    readonly route: TRoute;
    readonly params: ControllerRouteParams<TRoute>;
    readonly res: QueryControllerResponseBody<TController>;
};