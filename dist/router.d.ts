/// <reference types="koa" />
/// <reference types="koa-bodyparser" />
/// <reference types="koa-router" />
import * as Koa from "koa";
import { Container } from "n-ject";
export declare class Router {
    private readonly _koa;
    private readonly _container;
    private readonly _koaRouter;
    private readonly _controllers;
    constructor(koa: Koa, container: Container);
    registerControllers(...controllers: Function[]): void;
    configureRouting(viewResolutionRoot: string): void;
    private configureGet(registration);
    private configurePost(registration);
    private configurePut(registration);
    private configureDelete(registration);
    private handleRequest(ctx, registration, processBody);
    private createRouteArgs(route, ctx);
}
