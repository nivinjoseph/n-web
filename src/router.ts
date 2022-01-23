import * as Koa from "koa";
import * as KoaRouter from "koa-router";
import { Container, Scope } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
import { ControllerRegistration } from "./controller-registration";
import { Controller } from "./controller";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { RouteInfo } from "./route-info";
import { HttpMethods } from "./http-method";
import { HttpException } from "./exceptions/http-exception";
import { HttpRedirectException } from "./exceptions/http-redirect-exception";
import { AuthorizationHandler } from "./security/authorization-handler";
import { CallContext } from "./services/call-context/call-context";
import { ConfigurationManager } from "@nivinjoseph/n-config";
import { Profiler } from "@nivinjoseph/n-util";

export class Router
{
    private readonly _koa: Koa;
    private readonly _container: Container;
    private readonly _authorizationHandlerKey: string;
    private readonly _callContextKey: string;
    private readonly _koaRouter: KoaRouter;
    private readonly _controllers = new Array<ControllerRegistration>();
    
    
    public constructor(koa: Koa, container: Container, authorizationHandlerKey: string, callContextKey: string)
    {
        given(koa, "koa").ensureHasValue();
        given(container, "container").ensureHasValue();
        given(authorizationHandlerKey, "authorizationHandlerKey").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        given(callContextKey, "callContextKey").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        this._koa = koa;
        this._container = container;
        this._authorizationHandlerKey = authorizationHandlerKey;
        this._callContextKey = callContextKey;
        this._koaRouter = new KoaRouter();
    }
    
    
    public registerControllers(...controllers: Function[]): void
    {
        for (let controller of controllers)
        {
            if (this._controllers.some(t => t.controller === controller))
                throw new ApplicationException("Duplicate registration detected for Controller '{0}'."
                    .format((controller as Object).getTypeName()));

            let registration = new ControllerRegistration(controller);
            this._controllers.push(registration);
            this._container.registerScoped(registration.name, registration.controller);
        }
    }
    
    public configureRouting(viewResolutionRoot: string): void
    {
        let catchAllRegistration: ControllerRegistration = null;
        
        for (let registration of this._controllers)
        {
            registration.complete(viewResolutionRoot);
            
            if (registration.route.isCatchAll)
            {
                if (catchAllRegistration !== null)
                    throw new ApplicationException("Multiple catch all registrations detected");
                
                catchAllRegistration = registration;
                continue;
            }    
            
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
        
        if (catchAllRegistration)
        {
            // @ts-ignore
            this._koa.use(async (ctx, next) =>
            {
                await this.handleRequest(ctx as KoaRouter.IRouterContext, catchAllRegistration, false);
            });
        }
    }

    private configureGet(registration: ControllerRegistration): void
    {
        this._koaRouter.get(registration.route.koaRoute, async (ctx) =>
        {
            await this.handleRequest(ctx, registration, false);
        });
    }
    
    private configurePost(registration: ControllerRegistration): void
    {
        this._koaRouter.post(registration.route.koaRoute, async (ctx) =>
        {
            await this.handleRequest(ctx, registration, true);
        });
    }

    private configurePut(registration: ControllerRegistration): void
    {
        this._koaRouter.put(registration.route.koaRoute, async (ctx) =>
        {
            await this.handleRequest(ctx, registration, true);
        });
    }

    private configureDelete(registration: ControllerRegistration): void
    {
        this._koaRouter.del(registration.route.koaRoute, async (ctx) =>
        {
            await this.handleRequest(ctx, registration, true);
        });
    }
    
    private async handleRequest(ctx: KoaRouter.IRouterContext, registration: ControllerRegistration,
        processBody: boolean): Promise<void>
    {
        (<Profiler>ctx.state.profiler)?.trace("Request handling started");
        
        let scope = ctx.state.scope as Scope;
        let callContext = scope.resolve<CallContext>(this._callContextKey);
        
        (<Profiler>ctx.state.profiler)?.trace("Request callContext resolved");
        
        if (registration.authorizeClaims)
        {
            if (!callContext.isAuthenticated)
                throw new HttpException(401);
            
            let authorizationHandler = scope.resolve<AuthorizationHandler>(this._authorizationHandlerKey);
            let authorized = await authorizationHandler.authorize(callContext.identity, registration.authorizeClaims);
            (<Profiler>ctx.state.profiler)?.trace("Request authorized");
            if (!authorized)
                throw new HttpException(403);    
        }    
        
        let args = this.createRouteArgs(registration.route, ctx);
        
        if (processBody)
            args.push(ctx.request.body);
            
        (<Profiler>ctx.state.profiler)?.trace("Request args created");
        
        let controllerInstance = scope.resolve<Controller>(registration.name);
        (<any>controllerInstance).__ctx = ctx;
        
        (<Profiler>ctx.state.profiler)?.trace("Request controller created");
        
        let result: any;
        
        try 
        {
            result = await controllerInstance.execute(...args);
        }
        catch (error)
        {
            if (!(error instanceof HttpRedirectException))
                throw error;    
            
            ctx.redirect((error as HttpRedirectException).url);
            return;
        }
        finally
        {
            (<Profiler>ctx.state.profiler)?.trace("Request controller executed");
        }
        
        if (registration.view !== null)
        {
            let vm = result;
            if (typeof (vm) !== "object")
                vm = { value: result };
            
            let view = registration.view;
            let viewLayout = registration.viewLayout;
            if (viewLayout !== null)
                // tslint:disable
                view = eval("`" + viewLayout + "`");
            
            let html = eval("`" + view + "`") as string;
            // tslint:enable
            let config = Object.assign({ env: ConfigurationManager.getConfig("env") }, vm.config || {});
            html = html.replace("<body>",
                `
                    <body>
                    <script>
                        window.config = "${Buffer.from(JSON.stringify(config), "utf8").toString("hex")}";
                    </script>
                `);
            result = html;
            
            (<Profiler>ctx.state.profiler)?.trace("Request view rendered");
        }
        
        ctx.body = result;
    }
    
    private createRouteArgs(route: RouteInfo, ctx: KoaRouter.IRouterContext): Array<any>
    {
        let queryParams = ctx.query;
        let pathParams = ctx.params;
        let model: { [index: string]: any } = {};

        for (let key in queryParams)
        {
            let routeParam = route.findRouteParam(key);
            if (routeParam)
            {
                let parsed = routeParam.parseParam(queryParams[key] as string);
                model[routeParam.paramKey] = parsed;
                queryParams[key] = parsed;
            }
            else
            {
                let value = queryParams[key] as string;
                if (value === undefined || value == null || value.isEmptyOrWhiteSpace() || value.trim().toLowerCase() === "null")
                    queryParams[key] = null;    
            }
        }

        for (let key in pathParams)
        {
            let routeParam = route.findRouteParam(key);
            if (!routeParam)
                throw new HttpException(404);

            let parsed = routeParam.parseParam(pathParams[key]);
            model[routeParam.paramKey] = parsed;
            pathParams[key] = parsed;
        }

        let result = [];
        for (let routeParam of route.params)
        {
            let value = model[routeParam.paramKey];
            if (value === undefined || value === null)
            {
                if (!routeParam.isOptional)
                    throw new HttpException(404);

                value = null;
            }
            result.push(value);
        }

        return result;
    }
}