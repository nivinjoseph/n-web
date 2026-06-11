import { command } from "./command.js";
import { Controller } from "./controller.js";
import type { ControllerRouteParams } from "./route-params.js";

// public
@command
export abstract class CommandController<TReqBody, TResBody> extends Controller
{
    // the request body is always supplied as the last argument (after any route params)
    public abstract override execute(...params: [...routeParams: Array<any>, body: TReqBody]): Promise<TResBody>;
}

// public
// Extracts the request body type (TReqBody) from a concrete CommandController subclass,
// given either the class (constructor) or an instance type.
export type CommandControllerRequestBody<T> =
    T extends abstract new (...args: Array<any>) => infer TInstance
        ? TInstance extends CommandController<infer TReqBody, any> ? TReqBody : never
        : T extends CommandController<infer TReqBody, any> ? TReqBody : never;

// public
// Extracts the response body type (TResBody) from a concrete CommandController subclass,
// given either the class (constructor) or an instance type.
export type CommandControllerResponseBody<T> =
    T extends abstract new (...args: Array<any>) => infer TInstance
        ? TInstance extends CommandController<any, infer TResBody> ? TResBody : never
        : T extends CommandController<any, infer TResBody> ? TResBody : never;


/**
 * Endpoint contract for a command (write) operation. Like `QueryEndpoint` but bound to the concrete
 * `CommandController` that serves it: a single endpoint type validates the route, its resolved
 * params, the request body, and the response body together (e.g. for an `RpcClient.command`). The
 * request and response bodies are derived from the controller via {@link CommandControllerRequestBody}
 * and {@link CommandControllerResponseBody}, so they can never drift from the controller.
 *
 * @example
 * type CreateTodo = CommandEndpoint<typeof Routes.command.createTodo, CreateTodoController>;
 */
export type CommandEndpoint<
    TRoute extends string,
    TController extends CommandController<any, any> | (abstract new (...args: Array<any>) => CommandController<any, any>)
> = {
    readonly route: TRoute;
    readonly params: ControllerRouteParams<TRoute>;
    readonly req: CommandControllerRequestBody<TController>;
    readonly res: CommandControllerResponseBody<TController>;
};