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
var Koa = require("koa");
var KoaBodyParser = require("koa-bodyparser");
var n_ject_1 = require("n-ject");
var n_defensive_1 = require("n-defensive");
var router_1 = require("./router");
var n_exception_1 = require("n-exception");
// public
var WebApp = (function () {
    function WebApp(port) {
        this._exceptionLoggerKey = "$exceptionLogger";
        this._hasExceptionLogger = false;
        this._exceptionHandlerKey = "$exceptionHandler";
        this._hasExceptionHandler = false;
        n_defensive_1.given(port, "port").ensureHasValue();
        this._port = port;
        this._koa = new Koa();
        this._container = new n_ject_1.Container();
        this._router = new router_1.Router(this._koa, this._container);
    }
    WebApp.prototype.registerControllers = function () {
        var controllerClasses = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            controllerClasses[_i] = arguments[_i];
        }
        (_a = this._router).registerControllers.apply(_a, controllerClasses);
        return this;
        var _a;
    };
    WebApp.prototype.registerInstaller = function (installer) {
        n_defensive_1.given(installer, "installer").ensureHasValue();
        this._container.install(installer);
        return this;
    };
    WebApp.prototype.registerExceptionLogger = function (exceptionLoggerClass) {
        n_defensive_1.given(exceptionLoggerClass, "exceptionLoggerClass").ensureHasValue();
        this._container.registerScoped(this._exceptionLoggerKey, exceptionLoggerClass);
        this._hasExceptionLogger = true;
        return this;
    };
    WebApp.prototype.registerExceptionHandler = function (exceptionHandlerClass) {
        n_defensive_1.given(exceptionHandlerClass, "exceptionHandlerClass").ensureHasValue();
        this._container.registerScoped(this._exceptionHandlerKey, exceptionHandlerClass);
        this._hasExceptionHandler = true;
        return this;
    };
    WebApp.prototype.bootstrap = function () {
        this.configureContainer();
        this.configureScoping();
        this.configureHttpExceptionHandling();
        this.configureExceptionHandling();
        this.configureExceptionLogging();
        this.configureErrorTrapping();
        // this.configureAuthentication();
        // this.configureAuthorization();
        this.configureBodyParser();
        this.configureRouting(); // must be last
        this._koa.listen(this._port);
    };
    WebApp.prototype.configureContainer = function () {
        this._container.bootstrap();
    };
    WebApp.prototype.configureScoping = function () {
        var _this = this;
        this._koa.use(function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx.state.scope = this._container.createScope();
                        return [4 /*yield*/, next()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    WebApp.prototype.configureHttpExceptionHandling = function () {
        var _this = this;
        this._koa.use(function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
            var error_1, exp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, next()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        exp = error_1;
                        if (exp.name !== "HttpException")
                            throw error_1;
                        ctx.status = exp.statusCode;
                        if (exp.body !== null)
                            ctx.body = exp.body;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    WebApp.prototype.configureExceptionHandling = function () {
        var _this = this;
        this._koa.use(function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
            var error_2, exp, scope, exceptionHandler, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, next()];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_2 = _b.sent();
                        if (!this._hasExceptionHandler)
                            throw error_2;
                        exp = error_2;
                        if (exp.name === "HttpException")
                            throw error_2;
                        scope = ctx.state.scope;
                        exceptionHandler = scope.resolve(this._exceptionHandlerKey);
                        _a = ctx;
                        return [4 /*yield*/, exceptionHandler.handle(exp)];
                    case 3:
                        _a.body = _b.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    WebApp.prototype.configureExceptionLogging = function () {
        var _this = this;
        this._koa.use(function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
            var error_3, exp, scope, exceptionLogger;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, next()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_3 = _a.sent();
                        if (!this._hasExceptionLogger)
                            throw error_3;
                        exp = error_3;
                        if (exp.name === "HttpException")
                            throw error_3;
                        scope = ctx.state.scope;
                        exceptionLogger = scope.resolve(this._exceptionLoggerKey);
                        return [4 /*yield*/, exceptionLogger.log(exp)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    // private configureAuthentication(): void
    // {
    //     this._koa.use(async (ctx, next) => 
    //     {
    //         ctx.he
    //     });
    // }
    // private configureAuthorization(): void
    // {
    // }
    WebApp.prototype.configureErrorTrapping = function () {
        var _this = this;
        this._koa.use(function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, next()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        if (error_4 instanceof Error)
                            throw n_exception_1.Exception.fromError(error_4);
                        if (error_4 instanceof n_exception_1.Exception)
                            throw error_4;
                        throw new n_exception_1.Exception(error_4.toString());
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    WebApp.prototype.configureBodyParser = function () {
        this._koa.use(KoaBodyParser({ strict: true }));
    };
    WebApp.prototype.configureRouting = function () {
        this._router.configureRouting();
    };
    return WebApp;
}());
exports.WebApp = WebApp;
//# sourceMappingURL=web-app.js.map