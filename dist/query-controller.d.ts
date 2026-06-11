import { Controller } from "./controller.js";
import type { ControllerRoute, ControllerRouteParams } from "./route-params.js";
export declare abstract class QueryController<TResBody, TRoute extends string> extends Controller {
    readonly __route?: TRoute;
    abstract execute(...params: Array<any>): Promise<TResBody>;
}
export type QueryControllerResponseBody<T> = T extends abstract new (...args: Array<any>) => infer TInstance ? TInstance extends QueryController<infer TResBody, any> ? TResBody : never : T extends QueryController<infer TResBody, any> ? TResBody : never;
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
export type QueryEndpoint<TController extends QueryController<any, any> | (abstract new (...args: Array<any>) => QueryController<any, any>)> = {
    readonly route: ControllerRoute<TController>;
    readonly params: ControllerRouteParams<ControllerRoute<TController>>;
    readonly res: QueryControllerResponseBody<TController>;
};
//# sourceMappingURL=query-controller.d.ts.map