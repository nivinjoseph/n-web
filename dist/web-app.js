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
const Koa = require("koa");
const KoaBodyParser = require("koa-bodyparser");
const n_ject_1 = require("n-ject");
const n_defensive_1 = require("n-defensive");
const router_1 = require("./router");
const n_exception_1 = require("n-exception");
// public
class WebApp {
    constructor(port) {
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
    registerControllers(...controllerClasses) {
        this._router.registerControllers(...controllerClasses);
        return this;
    }
    registerInstaller(installer) {
        n_defensive_1.given(installer, "installer").ensureHasValue();
        this._container.install(installer);
        return this;
    }
    registerExceptionLogger(exceptionLoggerClass) {
        n_defensive_1.given(exceptionLoggerClass, "exceptionLoggerClass").ensureHasValue();
        this._container.registerScoped(this._exceptionLoggerKey, exceptionLoggerClass);
        this._hasExceptionLogger = true;
        return this;
    }
    registerExceptionHandler(exceptionHandlerClass) {
        n_defensive_1.given(exceptionHandlerClass, "exceptionHandlerClass").ensureHasValue();
        this._container.registerScoped(this._exceptionHandlerKey, exceptionHandlerClass);
        this._hasExceptionHandler = true;
        return this;
    }
    bootstrap() {
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
    }
    configureContainer() {
        this._container.bootstrap();
    }
    configureScoping() {
        this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            ctx.state.scope = this._container.createScope();
            yield next();
        }));
    }
    configureHttpExceptionHandling() {
        this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield next();
            }
            catch (error) {
                let exp = error;
                if (exp.name !== "HttpException")
                    throw error;
                ctx.status = exp.statusCode;
                if (exp.body !== null)
                    ctx.body = exp.body;
            }
        }));
    }
    configureExceptionHandling() {
        this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield next();
            }
            catch (error) {
                if (!this._hasExceptionHandler)
                    throw error;
                let exp = error;
                if (exp.name === "HttpException")
                    throw error;
                let scope = ctx.state.scope;
                let exceptionHandler = scope.resolve(this._exceptionHandlerKey);
                ctx.body = yield exceptionHandler.handle(exp);
            }
        }));
    }
    configureExceptionLogging() {
        this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield next();
            }
            catch (error) {
                if (!this._hasExceptionLogger)
                    throw error;
                let exp = error;
                if (exp.name === "HttpException")
                    throw error;
                let scope = ctx.state.scope;
                let exceptionLogger = scope.resolve(this._exceptionLoggerKey);
                yield exceptionLogger.log(exp);
            }
        }));
    }
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
    configureErrorTrapping() {
        this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield next();
            }
            catch (error) {
                if (error instanceof Error)
                    throw n_exception_1.Exception.fromError(error);
                if (error instanceof n_exception_1.Exception)
                    throw error;
                throw new n_exception_1.Exception(error.toString());
            }
        }));
    }
    configureBodyParser() {
        this._koa.use(KoaBodyParser({ strict: true }));
    }
    configureRouting() {
        this._router.configureRouting();
    }
}
exports.WebApp = WebApp;
//# sourceMappingURL=web-app.js.map