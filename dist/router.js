import { ConfigurationManager } from "@nivinjoseph/n-config";
import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { Container } from "@nivinjoseph/n-ject";
import { Profiler, Templator } from "@nivinjoseph/n-util";
import Koa from "koa";
import KoaRouter from "koa-router";
import { ControllerRegistration } from "./controller-registration.js";
import { Controller } from "./controller.js";
import { HttpException } from "./exceptions/http-exception.js";
import { HttpRedirectException } from "./exceptions/http-redirect-exception.js";
import { HttpMethods } from "./http-method.js";
import { RouteInfo } from "./route-info.js";
export class Router {
    _koa;
    _container;
    _authorizationHandlerKey;
    _callContextKey;
    _koaRouter;
    _controllers = new Array();
    constructor(koa, container, authorizationHandlerKey, callContextKey) {
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    registerControllers(...controllers) {
        for (const controller of controllers) {
            if (this._controllers.some(t => t.controller === controller))
                throw new ApplicationException("Duplicate registration detected for Controller '{0}'."
                    .format(controller.getTypeName()));
            const registration = new ControllerRegistration(controller);
            this._controllers.push(registration);
            this._container.registerScoped(registration.name, registration.controller);
        }
    }
    configureRouting(viewResolutionRoot) {
        given(viewResolutionRoot, "viewResolutionRoot").ensureIsString();
        let catchAllRegistration = null;
        for (const registration of this._controllers) {
            registration.complete(viewResolutionRoot);
            if (registration.route.isCatchAll) {
                if (catchAllRegistration != null)
                    throw new ApplicationException("Multiple catch all registrations detected");
                catchAllRegistration = registration;
                continue;
            }
            switch (registration.method) {
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
        if (catchAllRegistration != null) {
            this._koa.use(async (ctx, _next) => {
                await this._handleRequest(ctx, catchAllRegistration, false);
            });
        }
    }
    _configureGet(registration) {
        this._koaRouter.get(registration.route.koaRoute, async (ctx) => {
            await this._handleRequest(ctx, registration, false);
        });
    }
    _configurePost(registration) {
        this._koaRouter.post(registration.route.koaRoute, async (ctx) => {
            await this._handleRequest(ctx, registration, true);
        });
    }
    _configurePut(registration) {
        this._koaRouter.put(registration.route.koaRoute, async (ctx) => {
            await this._handleRequest(ctx, registration, true);
        });
    }
    _configureDelete(registration) {
        this._koaRouter.del(registration.route.koaRoute, async (ctx) => {
            await this._handleRequest(ctx, registration, true);
        });
    }
    async _handleRequest(ctx, registration, processBody) {
        const profiler = ctx.state.profiler;
        profiler?.trace("Request handling started");
        const scope = ctx.state.scope;
        const callContext = scope.resolve(this._callContextKey);
        profiler?.trace("Request callContext resolved");
        if (registration.authorizeClaims) {
            if (!callContext.isAuthenticated)
                throw new HttpException(401);
            const authorizationHandler = scope.resolve(this._authorizationHandlerKey);
            const authorized = await authorizationHandler.authorize(callContext.identity, registration.authorizeClaims);
            profiler?.trace("Request authorized");
            if (!authorized)
                throw new HttpException(403);
        }
        const args = this._createRouteArgs(registration.route, ctx);
        if (processBody)
            args.push(ctx.request.body);
        profiler?.trace("Request args created");
        const controllerInstance = scope.resolve(registration.name);
        controllerInstance.__ctx = ctx;
        profiler?.trace("Request controller created");
        let result;
        try {
            result = await controllerInstance.execute(...args);
        }
        catch (error) {
            if (!(error instanceof HttpRedirectException))
                throw error;
            ctx.redirect(error.url);
            return;
        }
        finally {
            profiler?.trace("Request controller executed");
        }
        if (registration.hasView) {
            let vm = result;
            if (typeof vm !== "object")
                vm = { value: result };
            let view = (await registration.retrieveView());
            const viewLayout = await registration.retrieveViewLayout();
            if (viewLayout !== null)
                view = viewLayout.replaceAll("${view}", view);
            let html = new Templator(view).render(vm);
            const config = Object.assign({ env: ConfigurationManager.getConfig("env") }, vm.config || {});
            html = html.replace("<body>", `
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
    _createRouteArgs(route, ctx) {
        const queryParams = ctx.query;
        const pathParams = ctx.params;
        const model = {};
        for (const key in queryParams) {
            const routeParam = route.findRouteParam(key);
            if (routeParam) {
                const parsed = routeParam.parseParam(queryParams[key]);
                model[routeParam.paramKey] = parsed;
                queryParams[key] = parsed;
            }
            else {
                const value = queryParams[key];
                if (value == null || value.isEmptyOrWhiteSpace() || value.trim().toLowerCase() === "null")
                    queryParams[key] = null;
            }
        }
        for (const key in pathParams) {
            const routeParam = route.findRouteParam(key);
            if (!routeParam)
                throw new HttpException(404);
            const parsed = routeParam.parseParam(pathParams[key]);
            model[routeParam.paramKey] = parsed;
            pathParams[key] = parsed;
        }
        const result = [];
        for (const routeParam of route.params) {
            let value = model[routeParam.paramKey];
            if (value === undefined || value === null) {
                if (!routeParam.isOptional)
                    throw new HttpException(404);
                value = null;
            }
            result.push(value);
        }
        return result;
    }
}
//# sourceMappingURL=router.js.map