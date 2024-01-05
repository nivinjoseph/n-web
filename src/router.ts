import Koa from "koa";
import KoaRouter from "koa-router";
import { Container, Scope } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
import { ControllerRegistration } from "./controller-registration.js";
import { Controller } from "./controller.js";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { RouteInfo } from "./route-info.js";
import { HttpMethods } from "./http-method.js";
import { HttpException } from "./exceptions/http-exception.js";
import { HttpRedirectException } from "./exceptions/http-redirect-exception.js";
import { AuthorizationHandler } from "./security/authorization-handler.js";
import { CallContext } from "./services/call-context/call-context.js";
import { ConfigurationManager } from "@nivinjoseph/n-config";
import { Profiler, Templator } from "@nivinjoseph/n-util";

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
    
    
    public registerControllers(...controllers: Array<Function>): void
    {
        for (const controller of controllers)
        {
            if (this._controllers.some(t => t.controller === controller))
                throw new ApplicationException("Duplicate registration detected for Controller '{0}'."
                    .format((controller as Object).getTypeName()));

            const registration = new ControllerRegistration(controller);
            this._controllers.push(registration);
            this._container.registerScoped(registration.name, registration.controller);
        }
    }
    
    public configureRouting(viewResolutionRoot?: string): void
    {
        given(viewResolutionRoot as string, "viewResolutionRoot").ensureIsString();
        
        let catchAllRegistration: ControllerRegistration | null = null;
        
        for (const registration of this._controllers)
        {
            registration.complete(viewResolutionRoot);
            
            if (registration.route.isCatchAll)
            {
                if (catchAllRegistration != null)
                    throw new ApplicationException("Multiple catch all registrations detected");
                
                catchAllRegistration = registration;
                continue;
            }    
            
            switch (registration.method)
            {
                case HttpMethods.Get:
                    this._configureGet(registration);
                    break;
                case HttpMethods.Post:
                    this._configurePost(registration);
                    break;
                case HttpMethods.Put:
                    this._configurePut(registration);
                    break;
                case HttpMethods.Delete:
                    this._configureDelete(registration);
                    break;
            }
        }

        this._koa.use(this._koaRouter.routes());
        this._koa.use(this._koaRouter.allowedMethods());
        
        if (catchAllRegistration != null)
        {
            this._koa.use(async (ctx, _next) =>
            {
                await this._handleRequest(ctx as KoaRouter.IRouterContext, catchAllRegistration!, false);
            });
        }
    }

    private _configureGet(registration: ControllerRegistration): void
    {
        this._koaRouter.get(registration.route.koaRoute, async (ctx) =>
        {
            await this._handleRequest(ctx, registration, false);
        });
    }
    
    private _configurePost(registration: ControllerRegistration): void
    {
        this._koaRouter.post(registration.route.koaRoute, async (ctx) =>
        {
            await this._handleRequest(ctx, registration, true);
        });
    }

    private _configurePut(registration: ControllerRegistration): void
    {
        this._koaRouter.put(registration.route.koaRoute, async (ctx) =>
        {
            await this._handleRequest(ctx, registration, true);
        });
    }

    private _configureDelete(registration: ControllerRegistration): void
    {
        this._koaRouter.del(registration.route.koaRoute, async (ctx) =>
        {
            await this._handleRequest(ctx, registration, true);
        });
    }
    
    private async _handleRequest(ctx: KoaRouter.IRouterContext, registration: ControllerRegistration,
        processBody: boolean): Promise<void>
    {
        const profiler = <Profiler | null>ctx.state.profiler;
        
        profiler?.trace("Request handling started");
        
        const scope = ctx.state.scope as Scope;
        const callContext = scope.resolve<CallContext>(this._callContextKey);
        
        profiler?.trace("Request callContext resolved");
        
        if (registration.authorizeClaims)
        {
            if (!callContext.isAuthenticated)
                throw new HttpException(401);
            
            const authorizationHandler = scope.resolve<AuthorizationHandler>(this._authorizationHandlerKey);
            const authorized = await authorizationHandler.authorize(callContext.identity!, registration.authorizeClaims);
            profiler?.trace("Request authorized");
            if (!authorized)
                throw new HttpException(403);    
        }    
        
        const args = this._createRouteArgs(registration.route, ctx);
        
        if (processBody)
            args.push(ctx.request.body);
            
        profiler?.trace("Request args created");
        
        const controllerInstance = scope.resolve<Controller>(registration.name);
        (<any>controllerInstance).__ctx = ctx;
        
        profiler?.trace("Request controller created");
        
        let result: any;
        
        try 
        {
            result = await controllerInstance.execute(...args);
        }
        catch (error)
        {
            if (!(error instanceof HttpRedirectException))
                throw error;    
            
            ctx.redirect(error.url);
            return;
        }
        finally
        {
            profiler?.trace("Request controller executed");
        }
        
        if (registration.hasView)
        {
            let vm = result;
            if (typeof vm !== "object")
                vm = { value: result };
            
            let view = (await registration.retrieveView())!;
            const viewLayout = await registration.retrieveViewLayout();
            
            
            // if (viewLayout !== null)
            //     // tslint:disable
            //     view = eval("`" + viewLayout + "`");
            
            // let html = eval("`" + view + "`") as string;
            // // tslint:enable
            
            if (viewLayout !== null)
                view = viewLayout.replaceAll("${view}", view);
            
            let html = new Templator(view).render(vm);
            
            
            const config = Object.assign({ env: ConfigurationManager.getConfig("env") }, vm.config || {});
            html = html.replace("<body>",
                `
                    <body>
                    <script>
                        window.config = "${Buffer.from(JSON.stringify(config), "utf8").toString("hex")}";
                    </script>
                `);
            result = html;
            
            profiler?.trace("Request view rendered");
        }
        
        ctx.body = result;
        
        profiler?.trace("Request handling ended");
    }
    
    private _createRouteArgs(route: RouteInfo, ctx: KoaRouter.IRouterContext): Array<any>
    {
        const queryParams = ctx.query as Record<string, string | null>;
        const pathParams = ctx.params;
        const model: { [index: string]: any; } = {};

        for (const key in queryParams)
        {
            const routeParam = route.findRouteParam(key);
            if (routeParam)
            {
                const parsed = routeParam.parseParam(queryParams[key] as string);
                model[routeParam.paramKey] = parsed;
                queryParams[key] = parsed;
            }
            else
            {
                const value = queryParams[key];
                if (value == null || value.isEmptyOrWhiteSpace() || value.trim().toLowerCase() === "null")
                    queryParams[key] = null;    
            }
        }

        for (const key in pathParams)
        {
            const routeParam = route.findRouteParam(key);
            if (!routeParam)
                throw new HttpException(404);

            const parsed = routeParam.parseParam(pathParams[key]);
            model[routeParam.paramKey] = parsed;
            pathParams[key] = parsed;
        }

        const result = [];
        for (const routeParam of route.params)
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