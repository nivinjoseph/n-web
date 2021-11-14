/// <reference types="koa-bodyparser" />
import "@nivinjoseph/n-ext";
import * as Koa from "koa";
import { Container } from "@nivinjoseph/n-ject";
export declare class Router {
    private readonly _koa;
    private readonly _container;
    private readonly _authorizationHandlerKey;
    private readonly _callContextKey;
    private readonly _koaRouter;
    private readonly _controllers;
    constructor(koa: Koa, container: Container, authorizationHandlerKey: string, callContextKey: string);
    registerControllers(...controllers: Function[]): void;
    configureRouting(viewResolutionRoot: string): void;
    private configureGet;
    private configurePost;
    private configurePut;
    private configureDelete;
    private handleRequest;
    private createRouteArgs;
}
