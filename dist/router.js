"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var KoaRouter = require("koa-router");
var n_defensive_1 = require("n-defensive");
var controller_registration_1 = require("./controller-registration");
var n_exception_1 = require("n-exception");
var param_parse_exception_1 = require("./param-parse-exception");
var http_method_1 = require("./http-method");
var Router = (function () {
    function Router(koa, container) {
        this._controllers = new Array();
        n_defensive_1.given(koa, "koa").ensureHasValue();
        n_defensive_1.given(container, "container").ensureHasValue();
        this._koa = koa;
        this._container = container;
        this._koaRouter = new KoaRouter();
    }
    Router.prototype.registerControllers = function () {
        var controllers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            controllers[_i] = arguments[_i];
        }
        var _loop_1 = function (controller) {
            if (this_1._controllers.some(function (t) { return t.controller === controller; }))
                throw new n_exception_1.ApplicationException("Duplicate registration detected for Controller '{0}'."
                    .format(controller.getTypeName()));
            var registration = new controller_registration_1.ControllerRegistration(controller);
            this_1._controllers.push(registration);
            this_1._container.registerScoped(registration.name, registration.controller);
        };
        var this_1 = this;
        for (var _a = 0, controllers_1 = controllers; _a < controllers_1.length; _a++) {
            var controller = controllers_1[_a];
            _loop_1(controller);
        }
    };
    Router.prototype.configureRouting = function () {
        for (var _i = 0, _a = this._controllers; _i < _a.length; _i++) {
            var registration = _a[_i];
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
    };
    Router.prototype.configureGet = function (registration) {
        var _this = this;
        this._koaRouter.get(registration.route.koaRoute, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handleRequest(ctx, registration, false)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Router.prototype.configurePost = function (registration) {
        var _this = this;
        this._koaRouter.post(registration.route.koaRoute, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handleRequest(ctx, registration, true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Router.prototype.configurePut = function (registration) {
        var _this = this;
        this._koaRouter.put(registration.route.koaRoute, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handleRequest(ctx, registration, true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Router.prototype.configureDelete = function (registration) {
        var _this = this;
        this._koaRouter.del(registration.route.koaRoute, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handleRequest(ctx, registration, true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Router.prototype.handleRequest = function (ctx, registration, processBody) {
        return __awaiter(this, void 0, void 0, function () {
            var args, exp, scope, controllerInstance, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            args = this.createRouteArgs(registration.route, ctx);
                        }
                        catch (error) {
                            exp = error;
                            if (exp.name === param_parse_exception_1.ParamParseException.getTypeName()) {
                                ctx.throw(404);
                            }
                            throw error;
                        }
                        if (processBody)
                            args.push(ctx.request.body);
                        try {
                            scope = ctx.state.scope;
                            controllerInstance = scope.resolve(registration.name);
                        }
                        catch (error) {
                            // TODO: do something
                            throw error;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, controllerInstance.execute.apply(controllerInstance, args)];
                    case 2:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        // TODO: do something
                        throw error_1;
                    case 4:
                        ctx.body = result;
                        return [2 /*return*/];
                }
            });
        });
    };
    Router.prototype.createRouteArgs = function (route, ctx) {
        var pathParams = ctx.params ? ctx.params : {};
        var queryParams = ctx.query ? ctx.query : {};
        var model = {};
        for (var key in queryParams) {
            var routeParam = route.findRouteParam(key);
            if (!routeParam)
                continue;
            model[routeParam.paramKey] = routeParam.parseParam(queryParams[key]);
        }
        for (var key in pathParams) {
            var routeParam = route.findRouteParam(key);
            if (!routeParam)
                throw new param_parse_exception_1.ParamParseException("Path param not found.");
            model[routeParam.paramKey] = routeParam.parseParam(pathParams[key]);
        }
        var result = [];
        for (var _i = 0, _a = route.params; _i < _a.length; _i++) {
            var routeParam = _a[_i];
            var value = model[routeParam.paramKey];
            if (value === undefined || model[routeParam.paramKey] == null) {
                if (!routeParam.isOptional)
                    throw new param_parse_exception_1.ParamParseException("Required param not provided.");
                value = null;
            }
            result.push(value);
        }
        return result;
    };
    return Router;
}());
exports.Router = Router;
//# sourceMappingURL=router.js.map