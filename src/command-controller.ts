import { command } from "./command.js";
import { Controller } from "./controller.js";

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

