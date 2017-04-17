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
const http_exception_1 = require("./http-exception");
const serve = require("koa-static");
const fs = require("fs");
const path = require("path");
require("n-ext");
const cors = require("kcors");
// public
class WebApp {
    constructor(port) {
        this._exceptionHandlerKey = "$exceptionHandler";
        this._hasExceptionHandler = false;
        this._staticFilePaths = new Array();
        this._enableCors = false;
        n_defensive_1.given(port, "port").ensureHasValue();
        this._port = port;
        this._koa = new Koa();
        this._container = new n_ject_1.Container();
        this._router = new router_1.Router(this._koa, this._container);
    }
    enableCors() {
        this._enableCors = true;
        return this;
    }
    registerStaticFilePaths(...filePaths) {
        for (let filePath of filePaths) {
            filePath = filePath.trim().toLowerCase();
            if (filePath.startsWith("/")) {
                if (filePath.length === 1)
                    throw new n_exception_1.ArgumentException("filePath[{0}]".format(filePath), "is root");
                filePath = filePath.substr(1);
            }
            filePath = path.join(process.cwd(), filePath);
            if (!fs.existsSync(filePath))
                throw new n_exception_1.ArgumentException("filePath[{0}]".format(filePath), "does not exist");
            if (this._staticFilePaths.some(t => t === filePath))
                throw new n_exception_1.ArgumentException("filePath[{0}]".format(filePath), "is duplicate");
            this._staticFilePaths.push(filePath);
        }
        return this;
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
    registerExceptionHandler(exceptionHandlerClass) {
        n_defensive_1.given(exceptionHandlerClass, "exceptionHandlerClass").ensureHasValue();
        this._container.registerScoped(this._exceptionHandlerKey, exceptionHandlerClass);
        this._hasExceptionHandler = true;
        return this;
    }
    bootstrap() {
        this.configureCors();
        this.configureContainer();
        this.configureScoping();
        this.configureHttpExceptionHandling();
        this.configureExceptionHandling();
        this.configureErrorTrapping();
        this.configureStaticFileServing();
        // this.configureAuthentication();
        // this.configureAuthorization();
        this.configureBodyParser();
        this.configureRouting(); // must be last
        this._koa.listen(this._port);
    }
    configureCors() {
        if (this._enableCors)
            this._koa.use(cors());
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
                if (!(error instanceof http_exception_1.HttpException))
                    throw error;
                let exp = error;
                ctx.status = exp.statusCode;
                if (exp.body !== undefined && exp.body !== null)
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
                if (error instanceof http_exception_1.HttpException)
                    throw error;
                let scope = ctx.state.scope;
                let exceptionHandler = scope.resolve(this._exceptionHandlerKey);
                ctx.body = yield exceptionHandler.handle(error);
            }
        }));
    }
    configureErrorTrapping() {
        this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield next();
            }
            catch (error) {
                if (error instanceof Error)
                    throw error;
                throw new n_exception_1.Exception(error.toString());
            }
        }));
    }
    configureStaticFileServing() {
        for (let path of this._staticFilePaths)
            this._koa.use(serve(path));
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