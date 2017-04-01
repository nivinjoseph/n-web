import * as Koa from "koa";
import * as KoaRouter from "koa-router";
import * as KoaBodyParser from "koa-bodyparser";
import { Container, ComponentInstaller, Lifestyle, Scope } from "n-ject";
import given from "n-defensive";
import { ApplicationException } from "n-exception";
import "n-ext";
import "reflect-metadata";
import { httpMethodSymbol, HttpMethods } from "./http-method";
import { httpRouteSymbol } from "./http-route";
import { Controller } from "./controller";

export class WebApp
{
    private readonly _port: number;
    private readonly _koa: Koa;
    private readonly _koaRouter: KoaRouter;
    private readonly _container: Container;
    private readonly _controllers = new Array<ControllerRegistration>();
    private readonly _installers = new Array<ComponentInstaller>();
    
    
    public constructor(port: number)
    {
        given(port, "port").ensureHasValue();
        this._port = port;
        this._koa = new Koa();
        this._koaRouter = new KoaRouter();
        this._container = new Container();
    }
    
    public registerControllers(...controllers: Function[]): this
    {
        for (let controller of controllers)
        {
            if (this._controllers.some(t => t.controller === controller))
                throw new ApplicationException("Duplicate registration detected for Controller '{0}'."
                    .format((controller as Object).getTypeName()));   
            
            let registration = new ControllerRegistration(controller);
            this._controllers.push(registration);
            this._container.register(registration.name, registration.controller, Lifestyle.Scoped);
        }
        
        return this;
    }
    
    public registerInstaller(installer: ComponentInstaller): this
    {
        given(installer, "installer").ensureHasValue();
        
        if (this._installers.some(t => t === installer))
            throw new ApplicationException("Duplicate registration detected for Component Installer '{0}'."
                .format((installer as Object).getTypeName()));  
        
        this._installers.push(installer);
        this._container.install(installer);
        return this;
    }
    
    public bootstrap(): void
    {
        this._container.bootstrap();
        this.configureScoping();
        this.configureBodyParser();
        this.configureRouting(); // must be last
        this._koa.listen(this._port);
    }
    
    private configureScoping(): void
    {
        this._koa.use(async (ctx, next) =>
        {
            ctx.state.scope = this._container.createScope();
            await next();
        });
    }
    
    private configureBodyParser()
    {
        this._koa.use(KoaBodyParser({strict: true}));
    }
    
    private configureRouting(): void
    {
        for (let registration of this._controllers)
        {
            switch (registration.method)
            {
                case HttpMethods.Get:
                    this.configureGet(registration);
                    break;
                case HttpMethods.Post:
                    this.configurePost(registration);    
                    break;
                case HttpMethods.Put:
                    this.configurePut(registration);    
                    break;
                case HttpMethods.Delete:
                    this.configureDelete(registration);    
                    break;    
            }
        }    
        
        this._koa.use(this._koaRouter.routes());
        this._koa.use(this._koaRouter.allowedMethods());
    }
    
    private configureGet(registration: ControllerRegistration): void
    {
        this._koaRouter.get(registration.route, async (ctx) =>
        {
            let scope = ctx.state.scope as Scope;
            let controllerInstance = scope.resolve<Controller<any, any>>(registration.name);
            console.log("url params", ctx.params);
            ctx.body = await controllerInstance.execute(ctx.params);
        });  
    }
    
    private configurePost(registration: ControllerRegistration): void
    {
        this._koaRouter.post(registration.route, async (ctx) =>
        {
            let scope = ctx.state.scope as Scope;
            let controllerInstance = scope.resolve<Controller<any, any>>(registration.name);
            ctx.body = await controllerInstance.execute(null);
        });  
    }
    
    private configurePut(registration: ControllerRegistration): void
    {
        this._koaRouter.put(registration.route, async (ctx) =>
        {
            let scope = ctx.state.scope as Scope;
            let controllerInstance = scope.resolve<Controller<any, any>>(registration.name);
            ctx.body = await controllerInstance.execute(null);
        });  
    }
    
    private configureDelete(registration: ControllerRegistration): void
    {
        this._koaRouter.del(registration.route, async (ctx) =>
        {
            let scope = ctx.state.scope as Scope;
            let controllerInstance = scope.resolve<Controller<any, any>>(registration.name);
            ctx.body = await controllerInstance.execute(null);
        });  
    }
    
}

class ControllerRegistration
{
    private readonly _name: string;
    private readonly _controller: Function;
    private readonly _method: string;
    private readonly _route: string;
    
    
    public get name(): string { return this._name; }
    public get controller(): Function { return this._controller; }
    public get method(): string { return this._method; }
    public get route(): string { return this._route; }
    
    
    
    public constructor(controller: Function)
    {
        given(controller, "controller").ensureHasValue();
        
        this._name = (<Object>controller).getTypeName();
        this._controller = controller;
        
        if (!Reflect.hasOwnMetadata(httpMethodSymbol, this._controller))
            throw new ApplicationException("Controller '{0}' does not have http method applied."
                .format(this._name));    
        
        if (!Reflect.hasOwnMetadata(httpRouteSymbol, this._controller))
            throw new ApplicationException("Controller '{0}' does not have http route applied."
                .format(this._name));    
        
        this._method = Reflect.getOwnMetadata(httpMethodSymbol, this._controller);
        this._route = Reflect.getOwnMetadata(httpRouteSymbol, this._controller);
    }
}