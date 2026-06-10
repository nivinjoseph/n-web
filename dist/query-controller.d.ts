import { Controller } from "./controller.js";
export declare abstract class QueryController<TResBody> extends Controller {
    abstract execute(...params: Array<any>): Promise<TResBody>;
}
export type QueryControllerResponseBody<T> = T extends abstract new (...args: Array<any>) => infer TInstance ? TInstance extends QueryController<infer TResBody> ? TResBody : never : T extends QueryController<infer TResBody> ? TResBody : never;
//# sourceMappingURL=query-controller.d.ts.map