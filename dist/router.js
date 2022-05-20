"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const tslib_1 = require("tslib");
const KoaRouter = require("koa-router");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const controller_registration_1 = require("./controller-registration");
const n_exception_1 = require("@nivinjoseph/n-exception");
const http_method_1 = require("./http-method");
const http_exception_1 = require("./exceptions/http-exception");
const http_redirect_exception_1 = require("./exceptions/http-redirect-exception");
const n_config_1 = require("@nivinjoseph/n-config");
const n_util_1 = require("@nivinjoseph/n-util");
class Router {
    constructor(koa, container, authorizationHandlerKey, callContextKey) {
        this._controllers = new Array();
        (0, n_defensive_1.given)(koa, "koa").ensureHasValue();
        (0, n_defensive_1.given)(container, "container").ensureHasValue();
        (0, n_defensive_1.given)(authorizationHandlerKey, "authorizationHandlerKey").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        (0, n_defensive_1.given)(callContextKey, "callContextKey").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._koa = koa;
        this._container = container;
        this._authorizationHandlerKey = authorizationHandlerKey;
        this._callContextKey = callContextKey;
        this._koaRouter = new KoaRouter();
    }
    registerControllers(...controllers) {
        for (const controller of controllers) {
            if (this._controllers.some(t => t.controller === controller))
                throw new n_exception_1.ApplicationException("Duplicate registration detected for Controller '{0}'."
                    .format(controller.getTypeName()));
            const registration = new controller_registration_1.ControllerRegistration(controller);
            this._controllers.push(registration);
            this._container.registerScoped(registration.name, registration.controller);
        }
    }
    configureRouting(viewResolutionRoot) {
        (0, n_defensive_1.given)(viewResolutionRoot, "viewResolutionRoot").ensureIsString();
        let catchAllRegistration = null;
        for (const registration of this._controllers) {
            registration.complete(viewResolutionRoot);
            if (registration.route.isCatchAll) {
                if (catchAllRegistration != null)
                    throw new n_exception_1.ApplicationException("Multiple catch all registrations detected");
                catchAllRegistration = registration;
                continue;
            }
            switch (registration.method) {
                case http_method_1.HttpMethods.Get:
                    this._configureGet(registration);
                    break;
                case http_method_1.HttpMethods.Post:
                    this._configurePost(registration);
                    break;
                case http_method_1.HttpMethods.Put:
                    this._configurePut(registration);
                    break;
                case http_method_1.HttpMethods.Delete:
                    this._configureDelete(registration);
                    break;
            }
        }
        this._koa.use(this._koaRouter.routes());
        this._koa.use(this._koaRouter.allowedMethods());
        if (catchAllRegistration != null) {
            this._koa.use((ctx, _next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this._handleRequest(ctx, catchAllRegistration, false);
            }));
        }
    }
    _configureGet(registration) {
        this._koaRouter.get(registration.route.koaRoute, (ctx) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this._handleRequest(ctx, registration, false);
        }));
    }
    _configurePost(registration) {
        this._koaRouter.post(registration.route.koaRoute, (ctx) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this._handleRequest(ctx, registration, true);
        }));
    }
    _configurePut(registration) {
        this._koaRouter.put(registration.route.koaRoute, (ctx) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this._handleRequest(ctx, registration, true);
        }));
    }
    _configureDelete(registration) {
        this._koaRouter.del(registration.route.koaRoute, (ctx) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this._handleRequest(ctx, registration, true);
        }));
    }
    _handleRequest(ctx, registration, processBody) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const profiler = ctx.state.profiler;
            profiler === null || profiler === void 0 ? void 0 : profiler.trace("Request handling started");
            const scope = ctx.state.scope;
            const callContext = scope.resolve(this._callContextKey);
            profiler === null || profiler === void 0 ? void 0 : profiler.trace("Request callContext resolved");
            if (registration.authorizeClaims) {
                if (!callContext.isAuthenticated)
                    throw new http_exception_1.HttpException(401);
                const authorizationHandler = scope.resolve(this._authorizationHandlerKey);
                const authorized = yield authorizationHandler.authorize(callContext.identity, registration.authorizeClaims);
                profiler === null || profiler === void 0 ? void 0 : profiler.trace("Request authorized");
                if (!authorized)
                    throw new http_exception_1.HttpException(403);
            }
            const args = this._createRouteArgs(registration.route, ctx);
            if (processBody)
                args.push(ctx.request.body);
            profiler === null || profiler === void 0 ? void 0 : profiler.trace("Request args created");
            const controllerInstance = scope.resolve(registration.name);
            controllerInstance.__ctx = ctx;
            profiler === null || profiler === void 0 ? void 0 : profiler.trace("Request controller created");
            let result;
            try {
                result = yield controllerInstance.execute(...args);
            }
            catch (error) {
                if (!(error instanceof http_redirect_exception_1.HttpRedirectException))
                    throw error;
                ctx.redirect(error.url);
                return;
            }
            finally {
                profiler === null || profiler === void 0 ? void 0 : profiler.trace("Request controller executed");
            }
            if (registration.view !== null) {
                let vm = result;
                if (typeof vm !== "object")
                    vm = { value: result };
                let view = registration.view;
                const viewLayout = registration.viewLayout;
                // if (viewLayout !== null)
                //     // tslint:disable
                //     view = eval("`" + viewLayout + "`");
                // let html = eval("`" + view + "`") as string;
                // // tslint:enable
                if (viewLayout !== null)
                    view = viewLayout.replaceAll("${view}", view);
                let html = new n_util_1.Templator(view).render(vm);
                const config = Object.assign({ env: n_config_1.ConfigurationManager.getConfig("env") }, vm.config || {});
                html = html.replace("<body>", `
                    <body>
                    <script>
                        window.config = "${Buffer.from(JSON.stringify(config), "utf8").toString("hex")}";
                    </script>
                `);
                result = html;
                profiler === null || profiler === void 0 ? void 0 : profiler.trace("Request view rendered");
            }
            ctx.body = result;
            profiler === null || profiler === void 0 ? void 0 : profiler.trace("Request handling ended");
        });
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
                throw new http_exception_1.HttpException(404);
            const parsed = routeParam.parseParam(pathParams[key]);
            model[routeParam.paramKey] = parsed;
            pathParams[key] = parsed;
        }
        const result = [];
        for (const routeParam of route.params) {
            let value = model[routeParam.paramKey];
            if (value === undefined || value === null) {
                if (!routeParam.isOptional)
                    throw new http_exception_1.HttpException(404);
                value = null;
            }
            result.push(value);
        }
        return result;
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map