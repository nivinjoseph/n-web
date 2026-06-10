import { Controller } from "./controller.js";
import { query } from "./query.js";

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
