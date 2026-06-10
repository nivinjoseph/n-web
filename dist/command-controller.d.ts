import { Controller } from "./controller.js";
export declare abstract class CommandController<TReqBody, TResBody> extends Controller {
    abstract execute(...params: [...routeParams: Array<any>, body: TReqBody]): Promise<TResBody>;
}
export type CommandControllerRequestBody<T> = T extends abstract new (...args: Array<any>) => infer TInstance ? TInstance extends CommandController<infer TReqBody, any> ? TReqBody : never : T extends CommandController<infer TReqBody, any> ? TReqBody : never;
export type CommandControllerResponseBody<T> = T extends abstract new (...args: Array<any>) => infer TInstance ? TInstance extends CommandController<any, infer TResBody> ? TResBody : never : T extends CommandController<any, infer TResBody> ? TResBody : never;
//# sourceMappingURL=command-controller.d.ts.map