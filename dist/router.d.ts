import { Container } from "@nivinjoseph/n-ject";
import Koa from "koa";
export declare class Router {
    private readonly _koa;
    private readonly _container;
    private readonly _authorizationHandlerKey;
    private readonly _callContextKey;
    private readonly _koaRouter;
    private readonly _controllers;
    constructor(koa: Koa, container: Container, authorizationHandlerKey: string, callContextKey: string);
    registerControllers(...controllers: Array<Function>): void;
    configureRouting(viewResolutionRoot?: string): void;
    private _configureGet;
    private _configurePost;
    private _configurePut;
    private _configureDelete;
    private _handleRequest;
    private _createRouteArgs;
}
//# sourceMappingURL=router.d.ts.map