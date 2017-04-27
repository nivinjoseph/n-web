"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const KoaRouter = require("koa-router");
const n_defensive_1 = require("n-defensive");
const controller_registration_1 = require("./controller-registration");
const n_exception_1 = require("n-exception");
const http_method_1 = require("./http-method");
const http_exception_1 = require("./http-exception");
const http_redirect_exception_1 = require("./http-redirect-exception");
class Router {
    constructor(koa, container) {
        this._controllers = new Array();
        n_defensive_1.given(koa, "koa").ensureHasValue();
        n_defensive_1.given(container, "container").ensureHasValue();
        this._koa = koa;
        this._container = container;
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
    configureRouting() {
        for (let registration of this._controllers) {
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
        return __awaiter(this, void 0, void 0, function* () {
            let args = this.createRouteArgs(registration.route, ctx);
            if (processBody)
                args.push(ctx.request.body);
            let scope = ctx.state.scope;
            let controllerInstance = scope.resolve(registration.name);
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
            if (registration.view !== null) {
                let vm = result;
                let view = registration.view;
                let viewLayout = registration.viewLayout;
                if (viewLayout !== null)
                    view = eval("`" + viewLayout + "`");
                result = eval("`" + view + "`");
            }
            ctx.body = result;
        });
    }
    createRouteArgs(route, ctx) {
        let pathParams = ctx.params ? ctx.params : {};
        let queryParams = ctx.query ? ctx.query : {};
        let model = {};
        for (let key in queryParams) {
            let routeParam = route.findRouteParam(key);
            if (!routeParam)
                continue;
            model[routeParam.paramKey] = routeParam.parseParam(queryParams[key]);
        }
        for (let key in pathParams) {
            let routeParam = route.findRouteParam(key);
            if (!routeParam)
                throw new http_exception_1.HttpException(404);
            model[routeParam.paramKey] = routeParam.parseParam(pathParams[key]);
        }
        let result = [];
        for (let routeParam of route.params) {
            let value = model[routeParam.paramKey];
            if (value === undefined || model[routeParam.paramKey] == null) {
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