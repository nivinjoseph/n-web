"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
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
        for (let controller of controllers) {
            if (this._controllers.some(t => t.controller === controller))
                throw new n_exception_1.ApplicationException("Duplicate registration detected for Controller '{0}'."
                    .format(controller.getTypeName()));
            let registration = new controller_registration_1.ControllerRegistration(controller);
            this._controllers.push(registration);
            this._container.registerScoped(registration.name, registration.controller);
        }
    }
    configureRouting(viewResolutionRoot) {
        let catchAllRegistration = null;
        for (let registration of this._controllers) {
            registration.complete(viewResolutionRoot);
            if (registration.route.isCatchAll) {
                if (catchAllRegistration !== null)
                    throw new n_exception_1.ApplicationException("Multiple catch all registrations detected");
                catchAllRegistration = registration;
                continue;
            }
            switch (registration.method) {
                case http_method_1.HttpMethods.Get:
                    this.configureGet(registration);
                    break;
                case http_method_1.HttpMethods.Post:
                    this.configurePost(registration);
                    break;
                case http_method_1.HttpMethods.Put:
                    this.configurePut(registration);
                    break;
                case http_method_1.HttpMethods.Delete:
                    this.configureDelete(registration);
                    break;
            }
        }
        this._koa.use(this._koaRouter.routes());
        this._koa.use(this._koaRouter.allowedMethods());
        if (catchAllRegistration) {
            // @ts-ignore
            this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
                yield this.handleRequest(ctx, catchAllRegistration, false);
            }));
        }
    }
    configureGet(registration) {
        this._koaRouter.get(registration.route.koaRoute, (ctx) => __awaiter(this, void 0, void 0, function* () {
            yield this.handleRequest(ctx, registration, false);
        }));
    }
    configurePost(registration) {
        this._koaRouter.post(registration.route.koaRoute, (ctx) => __awaiter(this, void 0, void 0, function* () {
            yield this.handleRequest(ctx, registration, true);
        }));
    }
    configurePut(registration) {
        this._koaRouter.put(registration.route.koaRoute, (ctx) => __awaiter(this, void 0, void 0, function* () {
            yield this.handleRequest(ctx, registration, true);
        }));
    }
    configureDelete(registration) {
        this._koaRouter.del(registration.route.koaRoute, (ctx) => __awaiter(this, void 0, void 0, function* () {
            yield this.handleRequest(ctx, registration, true);
        }));
    }
    handleRequest(ctx, registration, processBody) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = ctx.state.profiler) === null || _a === void 0 ? void 0 : _a.trace("Request handling started");
            let scope = ctx.state.scope;
            let callContext = scope.resolve(this._callContextKey);
            (_b = ctx.state.profiler) === null || _b === void 0 ? void 0 : _b.trace("Request callContext resolved");
            if (registration.authorizeClaims) {
                if (!callContext.isAuthenticated)
                    throw new http_exception_1.HttpException(401);
                let authorizationHandler = scope.resolve(this._authorizationHandlerKey);
                let authorized = yield authorizationHandler.authorize(callContext.identity, registration.authorizeClaims);
                (_c = ctx.state.profiler) === null || _c === void 0 ? void 0 : _c.trace("Request authorized");
                if (!authorized)
                    throw new http_exception_1.HttpException(403);
            }
            let args = this.createRouteArgs(registration.route, ctx);
            if (processBody)
                args.push(ctx.request.body);
            (_d = ctx.state.profiler) === null || _d === void 0 ? void 0 : _d.trace("Request args created");
            let controllerInstance = scope.resolve(registration.name);
            controllerInstance.__ctx = ctx;
            (_e = ctx.state.profiler) === null || _e === void 0 ? void 0 : _e.trace("Request controller created");
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
                (_f = ctx.state.profiler) === null || _f === void 0 ? void 0 : _f.trace("Request controller executed");
            }
            if (registration.view !== null) {
                let vm = result;
                if (typeof (vm) !== "object")
                    vm = { value: result };
                let view = registration.view;
                let viewLayout = registration.viewLayout;
                // if (viewLayout !== null)
                //     // tslint:disable
                //     view = eval("`" + viewLayout + "`");
                // let html = eval("`" + view + "`") as string;
                // // tslint:enable
                if (viewLayout !== null)
                    view = viewLayout.replaceAll("${view}", view);
                let html = (new n_util_1.Templator(view)).render(vm);
                const config = Object.assign({ env: n_config_1.ConfigurationManager.getConfig("env") }, vm.config || {});
                html = html.replace("<body>", `
                    <body>
                    <script>
                        window.config = "${Buffer.from(JSON.stringify(config), "utf8").toString("hex")}";
                    </script>
                `);
                result = html;
                (_g = ctx.state.profiler) === null || _g === void 0 ? void 0 : _g.trace("Request view rendered");
            }
            ctx.body = result;
            (_h = ctx.state.profiler) === null || _h === void 0 ? void 0 : _h.trace("Request handling ended");
        });
    }
    createRouteArgs(route, ctx) {
        let queryParams = ctx.query;
        let pathParams = ctx.params;
        let model = {};
        for (let key in queryParams) {
            let routeParam = route.findRouteParam(key);
            if (routeParam) {
                let parsed = routeParam.parseParam(queryParams[key]);
                model[routeParam.paramKey] = parsed;
                queryParams[key] = parsed;
            }
            else {
                let value = queryParams[key];
                if (value === undefined || value == null || value.isEmptyOrWhiteSpace() || value.trim().toLowerCase() === "null")
                    queryParams[key] = null;
            }
        }
        for (let key in pathParams) {
            let routeParam = route.findRouteParam(key);
            if (!routeParam)
                throw new http_exception_1.HttpException(404);
            let parsed = routeParam.parseParam(pathParams[key]);
            model[routeParam.paramKey] = parsed;
            pathParams[key] = parsed;
        }
        let result = [];
        for (let routeParam of route.params) {
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