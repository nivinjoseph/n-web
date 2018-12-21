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
const n_ject_1 = require("@nivinjoseph/n-ject");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const router_1 = require("./router");
const n_exception_1 = require("@nivinjoseph/n-exception");
const serve = require("koa-static");
const fs = require("fs");
const path = require("path");
require("@nivinjoseph/n-ext");
const cors = require("kcors");
const default_call_context_1 = require("./services/call-context/default-call-context");
const default_authorization_handler_1 = require("./security/default-authorization-handler");
const n_sec_1 = require("@nivinjoseph/n-sec");
const default_exception_handler_1 = require("./exceptions/default-exception-handler");
const http_exception_1 = require("./exceptions/http-exception");
const n_config_1 = require("@nivinjoseph/n-config");
const koaWebpack = require("koa-webpack");
const n_log_1 = require("@nivinjoseph/n-log");
const default_event_bus_1 = require("./services/event-bus/default-event-bus");
const event_handler_registration_1 = require("./services/event-bus/event-handler-registration");
const n_util_1 = require("@nivinjoseph/n-util");
const Http = require("http");
class WebApp {
    constructor(port, host) {
        this._callContextKey = "CallContext";
        this._eventBusKey = "EventBus";
        this._eventRegistrations = new Array();
        this._jobRegistrations = new Array();
        this._jobInstances = new Array();
        this._exceptionHandlerKey = "$exceptionHandler";
        this._hasExceptionHandler = false;
        this._authenticationHandlerKey = "$authenticationHandler";
        this._hasAuthenticationHandler = false;
        this._authHeaders = ["authorization"];
        this._authorizationHandlerKey = "$authorizationHandler";
        this._hasAuthorizationHandler = false;
        this._staticFilePaths = new Array();
        this._enableCors = false;
        this._webPackDevMiddlewarePublicPath = null;
        this._disposeActions = new Array();
        this._isBootstrapped = false;
        n_defensive_1.given(port, "port").ensureHasValue().ensureIsNumber();
        this._port = port;
        n_defensive_1.given(host, "host").ensureIsString();
        this._host = host ? host.trim() : null;
        this._koa = new Koa();
        this._container = new n_ject_1.Container();
        this._router = new router_1.Router(this._koa, this._container, this._authorizationHandlerKey, this._callContextKey);
    }
    enableCors() {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("enableCors");
        this._enableCors = true;
        return this;
    }
    registerStaticFilePath(filePath, cache = false) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerStaticFilePaths");
        n_defensive_1.given(filePath, "filePath").ensureHasValue().ensureIsString();
        n_defensive_1.given(cache, "cache").ensureHasValue().ensureIsBoolean();
        filePath = filePath.trim();
        if (filePath.startsWith("/")) {
            if (filePath.length === 1) {
                throw new n_exception_1.ArgumentException("filePath[{0}]".format(filePath), "is root");
            }
            filePath = filePath.substr(1);
        }
        filePath = path.join(process.cwd(), filePath);
        if (n_config_1.ConfigurationManager.getConfig("env") !== "dev") {
            if (!fs.existsSync(filePath))
                throw new n_exception_1.ArgumentException("filePath[{0}]".format(filePath), "does not exist");
        }
        if (this._staticFilePaths.some(t => t.path === filePath))
            throw new n_exception_1.ArgumentException("filePath[{0}]".format(filePath), "is duplicate");
        this._staticFilePaths.push({ path: filePath, cache: cache });
        return this;
    }
    registerControllers(...controllerClasses) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerControllers");
        this._router.registerControllers(...controllerClasses);
        return this;
    }
    registerEventHandlers(...eventHandlerClasses) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerEventHandlers");
        this._eventRegistrations.push(...eventHandlerClasses.map(t => new event_handler_registration_1.EventHandlerRegistration(t)));
        return this;
    }
    registerJobs(...jobClasses) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerJobs");
        this._jobRegistrations.push(...jobClasses);
        return this;
    }
    useLogger(logger) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("useLogger");
        n_defensive_1.given(logger, "logger").ensureHasValue().ensureIsObject();
        this._logger = logger;
        return this;
    }
    useInstaller(installer) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerInstaller");
        n_defensive_1.given(installer, "installer").ensureHasValue();
        this._container.install(installer);
        return this;
    }
    registerExceptionHandler(exceptionHandlerClass) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerExceptionHandler");
        n_defensive_1.given(exceptionHandlerClass, "exceptionHandlerClass").ensureHasValue();
        this._container.registerScoped(this._exceptionHandlerKey, exceptionHandlerClass);
        this._hasExceptionHandler = true;
        return this;
    }
    registerAuthenticationHandler(authenticationHandler, ...authHeaders) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerAuthenticationHandler");
        n_defensive_1.given(authenticationHandler, "authenticationHandler").ensureHasValue();
        n_defensive_1.given(authHeaders, "authHeaders").ensureHasValue().ensureIsArray();
        this._container.registerScoped(this._authenticationHandlerKey, authenticationHandler);
        this._hasAuthenticationHandler = true;
        if (authHeaders.length > 0)
            this._authHeaders = authHeaders;
        return this;
    }
    registerAuthorizationHandler(authorizationHandler) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerAuthorizationHandler");
        n_defensive_1.given(authorizationHandler, "authorizationHandler").ensureHasValue();
        this._container.registerScoped(this._authorizationHandlerKey, authorizationHandler);
        this._hasAuthorizationHandler = true;
        return this;
    }
    useViewResolutionRoot(path) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("useViewResolutionRoot");
        n_defensive_1.given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._viewResolutionRoot = path.trim();
        return this;
    }
    enableWebPackDevMiddleware(publicPath = "/") {
        n_defensive_1.given(publicPath, "publicPath").ensureHasValue().ensureIsString();
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("enableWebPackDevMiddleware");
        this._webPackDevMiddlewarePublicPath = publicPath.trim();
        return this;
    }
    registerDisposeAction(disposeAction) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerForDispose");
        n_defensive_1.given(disposeAction, "disposeAction").ensureHasValue().ensureIsFunction();
        this._disposeActions.push(() => {
            return new Promise((resolve) => {
                try {
                    disposeAction()
                        .then(() => resolve())
                        .catch((e) => {
                        this._logger.logError(e).then(() => resolve());
                    });
                }
                catch (error) {
                    this._logger.logError(error).then(() => resolve());
                }
            });
        });
        return this;
    }
    bootstrap() {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("bootstrap");
        if (!this._logger)
            this._logger = new n_log_1.ConsoleLogger();
        this._backgroundProcessor = new n_util_1.BackgroundProcessor((e) => this._logger.logError(e));
        this.registerDisposeAction(() => this._backgroundProcessor.dispose());
        this.configureCors();
        this.configureContainer();
        this.configureScoping();
        this.configureCallContext();
        this.configureExceptionHandling();
        this.configureErrorTrapping();
        this.configureAuthentication();
        this.configureStaticFileServing();
        this.configureBodyParser();
        this.configureRouting();
        const appEnv = n_config_1.ConfigurationManager.getConfig("env");
        const appName = n_config_1.ConfigurationManager.getConfig("appInfo.name");
        const appVersion = n_config_1.ConfigurationManager.getConfig("appInfo.version");
        const appDescription = n_config_1.ConfigurationManager.getConfig("appInfo.description");
        console.log("SERVER STARTING.");
        console.log(`ENV: ${appEnv}; NAME: ${appName}; VERSION: ${appVersion}; DESCRIPTION: ${appDescription}.`);
        this._server = Http.createServer(this._koa.callback());
        this._server.listen(this._port, this._host);
        this.configureWebPackDevMiddleware();
        this.configureShutDown();
        this._isBootstrapped = true;
        console.log("SERVER STARTED.");
    }
    configureCors() {
        if (this._enableCors)
            this._koa.use(cors());
    }
    configureContainer() {
        this._container.registerScoped(this._callContextKey, default_call_context_1.DefaultCallContext);
        this._container.registerSingleton(this._eventBusKey, default_event_bus_1.DefaultEventBus);
        this._eventRegistrations.forEach(t => this._container.registerSingleton(t.eventHandlerTypeName, t.eventHandlerType));
        this._jobRegistrations.forEach(jobClass => this._container.registerSingleton(jobClass.getTypeName(), jobClass));
        if (!this._hasAuthorizationHandler)
            this._container.registerScoped(this._authorizationHandlerKey, default_authorization_handler_1.DefaultAuthorizationHandler);
        if (!this._hasExceptionHandler)
            this._container.registerInstance(this._exceptionHandlerKey, new default_exception_handler_1.DefaultExceptionHandler(this._logger));
        this._container.bootstrap();
        const eventBusInstance = this._container.resolve(this._eventBusKey);
        eventBusInstance.useProcessor(this._backgroundProcessor);
        this._eventRegistrations.forEach(t => eventBusInstance.subscribe(t.eventTypeName, this._container.resolve(t.eventHandlerTypeName)));
        this._jobRegistrations.forEach(jobClass => this._jobInstances.push(this._container.resolve(jobClass.getTypeName())));
        this._jobInstances.forEach(t => this.registerDisposeAction(() => t.dispose()));
    }
    configureScoping() {
        this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            ctx.state.scope = this._container.createScope();
            yield next();
        }));
    }
    configureCallContext() {
        this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            let scope = ctx.state.scope;
            let defaultCallContext = scope.resolve(this._callContextKey);
            defaultCallContext.configure(ctx, this._authHeaders);
            yield next();
        }));
    }
    configureExceptionHandling() {
        this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield next();
            }
            catch (error) {
                if (error instanceof http_exception_1.HttpException) {
                    ctx.status = error.statusCode;
                    if (error.body !== undefined && error.body !== null)
                        ctx.body = error.body;
                    return;
                }
                let scope = ctx.state.scope;
                let exceptionHandler = scope.resolve(this._exceptionHandlerKey);
                try {
                    const result = yield exceptionHandler.handle(error);
                    ctx.body = result;
                }
                catch (exp) {
                    if (exp instanceof http_exception_1.HttpException) {
                        const httpExp = exp;
                        ctx.status = httpExp.statusCode;
                        if (httpExp.body !== undefined && httpExp.body !== null)
                            ctx.body = httpExp.body;
                    }
                    else {
                        yield this._logger.logError(exp);
                        ctx.status = 500;
                        ctx.body = "There was an error processing your request.";
                    }
                }
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
                throw new n_exception_1.Exception("TRAPPED ERROR | " + error.toString());
            }
        }));
    }
    configureAuthentication() {
        if (!this._hasAuthenticationHandler)
            return;
        this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            let scope = ctx.state.scope;
            let callContext = scope.resolve(this._callContextKey);
            if (callContext.hasAuth) {
                let authenticationHandler = scope.resolve(this._authenticationHandlerKey);
                let identity = yield authenticationHandler.authenticate(callContext.authScheme, callContext.authToken);
                if (identity && identity instanceof n_sec_1.ClaimsIdentity)
                    ctx.state.identity = identity;
            }
            yield next();
        }));
    }
    configureStaticFileServing() {
        for (let item of this._staticFilePaths)
            this._koa.use(serve(item.path, item.cache ? { maxage: 1000 * 60 * 60 * 24 * 365 } : null));
    }
    configureBodyParser() {
        this._koa.use(KoaBodyParser({
            strict: true,
            jsonLimit: "250mb"
        }));
    }
    configureRouting() {
        this._router.configureRouting(this._viewResolutionRoot);
    }
    configureWebPackDevMiddleware() {
        if (n_config_1.ConfigurationManager.getConfig("env") === "dev" && this._webPackDevMiddlewarePublicPath != null) {
            koaWebpack({
                devMiddleware: {
                    publicPath: this._webPackDevMiddlewarePublicPath,
                    writeToDisk: true,
                },
                hotClient: {
                    hmr: true,
                    reload: true,
                    server: this._server
                }
            }).then((middleware) => this._koa.use(middleware));
        }
    }
    configureShutDown() {
        if (n_config_1.ConfigurationManager.getConfig("env") === "dev")
            return;
        this.registerDisposeAction(() => {
            console.log("CLEANING UP. PLEASE WAIT...");
            return n_util_1.Delay.seconds(10);
        });
        const shutDown = (signal) => {
            this._server.close(() => {
                console.log(`SERVER STOPPING (${signal}).`);
                Promise.all(this._disposeActions.map(t => t()))
                    .then(() => {
                    console.log(`SERVER STOPPED (${signal}).`);
                    process.exit(0);
                })
                    .catch((e) => {
                    console.error(e);
                    process.exit(1);
                });
            });
        };
        process.on("SIGTERM", () => shutDown("SIGTERM"));
        process.on("SIGINT", () => shutDown("SIGINT"));
    }
}
exports.WebApp = WebApp;
//# sourceMappingURL=web-app.js.map