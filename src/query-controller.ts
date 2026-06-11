import { Controller } from "./controller.js";
import { query } from "./query.js";
import type { ControllerRoute, ControllerRouteParams } from "./route-params.js";

// public
@query
export abstract class QueryController<TResBody, TRoute extends string = string> extends Controller
{
    // Phantom marker carrying the route this controller is declared for (supplied via TRoute).
    // It lets `@route` verify the decorator argument and lets `QueryEndpoint` derive the route.
    // `declare` means it is type-only — nothing is emitted.
    declare public readonly __route?: TRoute;

    public abstract override execute(...params: Array<any>): Promise<TResBody>;
}

// public
// Extracts the response body type (TResBody) from a concrete QueryController subclass,
// given either the class (constructor) or an instance type.
export type QueryControllerResponseBody<T> =
    T extends abstract new (...args: Array<any>) => infer TInstance
        ? TInstance extends QueryController<infer TResBody, any> ? TResBody : never
        : T extends QueryController<infer TResBody, any> ? TResBody : never;

/**
 * Endpoint contract for a query (read) operation, derived entirely from the concrete
 * `QueryController` that serves it: the route (from the controller's declared route), its resolved
 * params, and the response body. A single generic is all a client passes (e.g. to `RpcClient.query`),
 * and there is no separate route argument that could drift from the controller.
 *
 * @example
 * type GetTodo = QueryEndpoint<GetTodoController>;
 *   // route: <GetTodoController's declared route>; params: { id: number }; res: <its response body>
 */
export type QueryEndpoint<
    TController extends QueryController<any, any> | (abstract new (...args: Array<any>) => QueryController<any, any>)
> = {
    readonly route: ControllerRoute<TController>;
    readonly params: ControllerRouteParams<ControllerRoute<TController>>;
    readonly res: QueryControllerResponseBody<TController>;
};
