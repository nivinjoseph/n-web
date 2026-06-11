import { command } from "./command.js";
import { Controller } from "./controller.js";
import type { ControllerRoute, ControllerRouteParams } from "./route-params.js";

// public
@command
export abstract class CommandController<TReqBody, TResBody, TRoute extends string = string> extends Controller
{
    // Phantom marker carrying the route this controller is declared for (supplied via TRoute).
    // It lets `@route` verify the decorator argument and lets `CommandEndpoint` derive the route.
    // `declare` means it is type-only — nothing is emitted.
    declare public readonly __route?: TRoute;

    // the request body is always supplied as the last argument (after any route params)
    public abstract override execute(...params: [...routeParams: Array<any>, body: TReqBody]): Promise<TResBody>;
}

// public
// Extracts the request body type (TReqBody) from a concrete CommandController subclass,
// given either the class (constructor) or an instance type.
export type CommandControllerRequestBody<T> =
    T extends abstract new (...args: Array<any>) => infer TInstance
        ? TInstance extends CommandController<infer TReqBody, any, any> ? TReqBody : never
        : T extends CommandController<infer TReqBody, any, any> ? TReqBody : never;

// public
// Extracts the response body type (TResBody) from a concrete CommandController subclass,
// given either the class (constructor) or an instance type.
export type CommandControllerResponseBody<T> =
    T extends abstract new (...args: Array<any>) => infer TInstance
        ? TInstance extends CommandController<any, infer TResBody, any> ? TResBody : never
        : T extends CommandController<any, infer TResBody, any> ? TResBody : never;


/**
 * Endpoint contract for a command (write) operation, derived entirely from the concrete
 * `CommandController` that serves it: the route (from the controller's declared route), its resolved
 * params, the request body, and the response body. A single generic is all a client passes (e.g. to
 * `RpcClient.command`), and there is no separate route argument that could drift from the controller.
 *
 * @example
 * type CreateTodo = CommandEndpoint<CreateTodoController>;
 */
export type CommandEndpoint<
    TController extends CommandController<any, any, any> | (abstract new (...args: Array<any>) => CommandController<any, any, any>)
> = {
    readonly route: ControllerRoute<TController>;
    readonly params: ControllerRouteParams<ControllerRoute<TController>>;
    readonly req: CommandControllerRequestBody<TController>;
    readonly res: CommandControllerResponseBody<TController>;
};
