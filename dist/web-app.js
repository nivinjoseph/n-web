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
exports.WebApp = void 0;
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
// const koaWebpack = require("@nivinjoseph/koa-webpack");
const n_log_1 = require("@nivinjoseph/n-log");
const n_util_1 = require("@nivinjoseph/n-util");
const Http = require("http");
const backend_1 = require("@nivinjoseph/n-sock/dist/backend");
const Compress = require("koa-compress");
// import Compress = require("kompression");
// const Compress = require("@nivinjoseph/kompression");
// public
class WebApp {
    constructor(port, host, container) {
        this._callContextKey = "CallContext";
        // private _edaConfig: EdaConfig;
        // private _edaManager: EdaManager;
        // private _backgroundProcessor: BackgroundProcessor;
        // private readonly _jobRegistrations = new Array<Function>();
        // private readonly _jobInstances = new Array<Job>();
        this._exceptionHandlerKey = "$exceptionHandler";
        this._hasExceptionHandler = false;
        this._authenticationHandlerKey = "$authenticationHandler";
        this._hasAuthenticationHandler = false;
        this._authHeaders = ["authorization"];
        this._authorizationHandlerKey = "$authorizationHandler";
        this._hasAuthorizationHandler = false;
        this._startupScriptKey = "$startupScript";
        this._hasStartupScript = false;
        this._shutdownScriptKey = "$shutdownScript";
        this._hasShutdownScript = false;
        this._staticFilePaths = new Array();
        this._enableCors = false;
        this._enableCompression = false;
        this._webPackDevMiddlewarePublicPath = null;
        // // @ts-ignore
        // private _webPackDevMiddlewareClientHost: string | null = null;
        // // @ts-ignore
        // private _webPackDevMiddlewareServerHost: string | null = null;    
        this._enableWebSockets = false;
        this._corsOrigin = null;
        this._socketServerRedisClient = null;
        this._socketServer = null;
        this._disposeActions = new Array();
        this._isBootstrapped = false;
        this._isShutDown = false;
        n_defensive_1.given(port, "port").ensureHasValue().ensureIsNumber();
        this._port = port;
        n_defensive_1.given(host, "host").ensureIsString();
        this._host = host ? host.trim() : null;
        n_defensive_1.given(container, "container").ensureIsObject().ensureIsType(n_ject_1.Container);
        this._koa = new Koa();
        this._container = container !== null && container !== void 0 ? container : new n_ject_1.Container();
        this._router = new router_1.Router(this._koa, this._container, this._authorizationHandlerKey, this._callContextKey);
    }
    get containerRegistry() { return this._container; }
    enableCors() {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("enableCors");
        this._enableCors = true;
        return this;
    }
    enableCompression() {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("enableCompression");
        this._enableCompression = true;
        return this;
    }
    // public enableEda(config: EdaConfig): this
    // {
    //     if (this._isBootstrapped)
    //         throw new InvalidOperationException("enableEda"); 
    //     given(config, "config").ensureHasValue().ensureIsObject();
    //     this._edaConfig = config;
    //     return this;
    // }
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
        // We skip the defensive check in dev because of webpack HMR 
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
    // public registerEventHandlers(...eventHandlerClasses: Function[]): this
    // {
    //     if (this._isBootstrapped)
    //         throw new InvalidOperationException("registerEventHandlers");
    //     this._eventRegistrations.push(...eventHandlerClasses.map(t => new EventHandlerRegistration(t)));
    //     return this;
    // }
    // public registerJobs(...jobClasses: Function[]): this
    // {
    //     if (this._isBootstrapped)
    //         throw new InvalidOperationException("registerJobs");
    //     this._jobRegistrations.push(...jobClasses);
    //     return this;
    // }
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
    registerStartupScript(applicationScriptClass) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerStartupScript");
        n_defensive_1.given(applicationScriptClass, "applicationScriptClass").ensureHasValue().ensureIsFunction();
        this._container.registerSingleton(this._startupScriptKey, applicationScriptClass);
        this._hasStartupScript = true;
        return this;
    }
    registerShutdownScript(applicationScriptClass) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerShutdownScript");
        n_defensive_1.given(applicationScriptClass, "applicationScriptClass").ensureHasValue().ensureIsFunction();
        this._container.registerSingleton(this._shutdownScriptKey, applicationScriptClass);
        this._hasShutdownScript = true;
        return this;
    }
    registerExceptionHandler(exceptionHandlerClass) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerExceptionHandler");
        n_defensive_1.given(exceptionHandlerClass, "exceptionHandlerClass").ensureHasValue().ensureIsFunction();
        this._container.registerScoped(this._exceptionHandlerKey, exceptionHandlerClass);
        this._hasExceptionHandler = true;
        return this;
    }
    registerAuthenticationHandler(authenticationHandler, ...authHeaders) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerAuthenticationHandler");
        n_defensive_1.given(authenticationHandler, "authenticationHandler").ensureHasValue().ensureIsFunction();
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
    enableWebSockets(corsOrigin, socketServerRedisClient) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("enableWebSockets");
        n_defensive_1.given(corsOrigin, "corsOrigin").ensureHasValue().ensureIsString();
        this._corsOrigin = corsOrigin.trim();
        n_defensive_1.given(socketServerRedisClient, "socketServerRedisClient").ensureHasValue().ensureIsObject();
        this._socketServerRedisClient = socketServerRedisClient;
        this._enableWebSockets = true;
        return this;
    }
    /**
     *
     * @param publicPath Webpack publicPath value
     * @description Requires dev dependencies [koa-webpack, memory-fs]
     */
    enableWebPackDevMiddleware(publicPath = "/") {
        n_defensive_1.given(publicPath, "publicPath").ensureHasValue().ensureIsString();
        // given(clientHost, "clientHost").ensureIsString();
        // given(serverHost, "serverHost").ensureIsString();
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("enableWebPackDevMiddleware");
        this._webPackDevMiddlewarePublicPath = publicPath.trim();
        // this._webPackDevMiddlewareClientHost = clientHost ? clientHost.trim() : null;
        // this._webPackDevMiddlewareServerHost = serverHost ? serverHost.trim() : null;
        // if (ConfigurationManager.getConfig<string>("env") === "dev")
        //     this._koa.use(webPackMiddleware(
        //         {
        //             dev: { publicPath, writeToDisk: true },
        //             hot: <any>{ reload: true, hot: true }
        //         } as any
        //     ));
        // if (ConfigurationManager.getConfig<string>("env") === "dev")
        // {
        //     // tslint:disable-next-line
        //     koaWebpack({
        //         devMiddleware: {
        //             publicPath: publicPath,
        //             writeToDisk: true,
        //         },
        //         hotClient: {
        //             hmr: true,
        //             reload: true,
        //             server: this._server
        //         }
        //     }).then((middleware) => this._koa.use(middleware));
        // }
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
                        console.error(e);
                        resolve();
                        // // tslint:disable-next-line
                        // this._logger.logError(e).then(() => resolve());
                    });
                }
                catch (error) {
                    console.error(error);
                    resolve();
                    // // tslint:disable-next-line
                    // this._logger.logError(error).then(() => resolve());
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
        // this._backgroundProcessor = new BackgroundProcessor((e) => this._logger.logError(e as any));
        // this.registerDisposeAction(() => this._backgroundProcessor.dispose());
        this.configureCors();
        // this.configureEda();
        this.configureContainer();
        // this.initializeJobs();
        this.configureStartup()
            .then(() => {
            this._server = Http.createServer();
            // this.configureWebSockets();
            this._server.listen(this._port, this._host);
            // this is the request response pipeline START
            this.configureScoping(); // must be first
            this.configureCallContext();
            this.configureCompression();
            this.configureExceptionHandling();
            this.configureErrorTrapping();
            this.configureAuthentication();
            this.configureStaticFileServing();
            return this.configureWebPackDevMiddleware();
        })
            .then(() => {
            this.configureBodyParser();
            this.configureRouting(); // must be last
            // this is the request response pipeline END
            const appEnv = n_config_1.ConfigurationManager.getConfig("env");
            const appName = n_config_1.ConfigurationManager.getConfig("package.name");
            const appVersion = n_config_1.ConfigurationManager.getConfig("package.version");
            const appDescription = n_config_1.ConfigurationManager.getConfig("package.description");
            console.log(`ENV: ${appEnv}; NAME: ${appName}; VERSION: ${appVersion}; DESCRIPTION: ${appDescription}.`);
            // this._server = Http.createServer(this._koa.callback());
            this.configureWebSockets();
            this.configureShutDown();
            this._server.on("request", this._koa.callback());
            // this._server.listen(this._port, this._host);
            // this.configureWebPackDevMiddleware();
            this._isBootstrapped = true;
            console.log("SERVER STARTED.");
        })
            .catch(e => {
            console.error("STARTUP FAILED!!!");
            console.error(e);
            throw e;
        });
    }
    configureCors() {
        if (this._enableCors)
            this._koa.use(cors());
    }
    // private configureEda(): void
    // {
    //     if (this._edaConfig)
    //     {
    //         this._edaManager = new EdaManager(this._edaConfig);
    //         this._container.registerInstance(this._edaManager.eventBusKey, this._edaManager.eventBus);
    //         this._container.registerInstance(this._edaManager.eventSubMgrKey, this._edaManager.eventSubMgr);
    //         this.registerDisposeAction(() => this._edaManager.dispose());
    //     }
    // }
    configureContainer() {
        this._container.registerScoped(this._callContextKey, default_call_context_1.DefaultCallContext);
        // this._jobRegistrations.forEach(jobClass => this._container.registerSingleton((<Object>jobClass).getTypeName(), jobClass));
        if (!this._hasAuthorizationHandler)
            this._container.registerScoped(this._authorizationHandlerKey, default_authorization_handler_1.DefaultAuthorizationHandler);
        if (!this._hasExceptionHandler)
            this._container.registerInstance(this._exceptionHandlerKey, new default_exception_handler_1.DefaultExceptionHandler(this._logger));
        this._container.bootstrap();
        this.registerDisposeAction(() => this._container.dispose());
    }
    configureStartup() {
        console.log("SERVER STARTING.");
        if (!this._hasStartupScript)
            return Promise.resolve();
        return this._container.resolve(this._startupScriptKey).run();
    }
    // private initializeJobs(): void
    // {
    //     this._jobRegistrations.forEach(jobClass =>
    //         this._jobInstances.push(this._container.resolve((<Object>jobClass).getTypeName())));
    // }
    // this is the first
    configureScoping() {
        this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            if (this._isShutDown) {
                ctx.response.status = 503;
                ctx.response.body = "Server shutdown.";
                return;
            }
            ctx.state.scope = this._container.createScope();
            try {
                yield next();
            }
            catch (error) {
                throw error;
            }
            finally {
                yield ctx.state.scope.dispose();
            }
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
    configureCompression() {
        if (this._enableCompression)
            this._koa.use(Compress());
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
                        // let logMessage = "";
                        // if (exp instanceof Exception)
                        //     logMessage = exp.toString();
                        // else if (exp instanceof Error)
                        //     logMessage = exp.stack;
                        // else
                        //     logMessage = exp.toString();
                        // console.log(Date.now(), logMessage);
                        yield this._logger.logError(exp);
                        ctx.status = 500;
                        ctx.body = "There was an error processing your request.";
                    }
                }
            }
        }));
    }
    configureErrorTrapping() {
        // @ts-ignore
        this._koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield next();
            }
            catch (error) {
                if (error instanceof Error)
                    throw error;
                let message = error.toString();
                if (message === "[object Object]") {
                    console.error(error);
                    message = JSON.stringify(error);
                }
                throw new n_exception_1.Exception("TRAPPED ERROR | " + message);
            }
        }));
    }
    // private configureEventHandling(): void
    // {
    //     this._koa.use(async (ctx, next) =>
    //     {
    //         let scope: Scope = ctx.state.scope;
    //         let eventAggregator = scope.resolve<DefaultEventAggregator>(this._eventAggregatorKey);
    //         eventAggregator.useProcessor(this._backgroundProcessor);
    //         this._eventRegistrations.forEach(t => eventAggregator.subscribe(t.eventName, scope.resolve(t.eventHandlerName)));
    //         await next();
    //     });
    // }
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
    // this is the last
    configureRouting() {
        this._router.configureRouting(this._viewResolutionRoot);
    }
    configureWebSockets() {
        if (!this._enableWebSockets)
            return;
        this._socketServer = new backend_1.SocketServer(this._server, this._corsOrigin, this._socketServerRedisClient);
        this.registerDisposeAction(() => this._socketServer.dispose());
    }
    configureWebPackDevMiddleware() {
        if (n_config_1.ConfigurationManager.getConfig("env") === "dev" && this._webPackDevMiddlewarePublicPath != null) {
            // // tslint:disable-next-line
            // koaWebpack({
            //     devMiddleware: {
            //         publicPath: this._webPackDevMiddlewarePublicPath,
            //         writeToDisk: true,
            //     },
            //     hotClient: false
            // }).then((middleware) => this._koa.use(middleware));
            // const koaWebpack = require("@nivinjoseph/koa-webpack");
            const koaWebpack = require("koa-webpack");
            // tslint:disable-next-line
            return koaWebpack({
                devMiddleware: {
                    publicPath: this._webPackDevMiddlewarePublicPath,
                    writeToDisk: false,
                },
                hotClient: {
                    hmr: true,
                    reload: true,
                    server: this._server
                }
            }).then((middleware) => {
                this._koa.use(middleware);
                const HmrHelper = require("./hmr-helper").HmrHelper;
                HmrHelper.configure(middleware.devMiddleware.fileSystem);
            });
            // if (this._webPackDevMiddlewareClientHost)
            // {
            //     // tslint:disable-next-line
            //     koaWebpack({
            //         devMiddleware: {
            //             publicPath: this._webPackDevMiddlewarePublicPath,
            //             writeToDisk: true,
            //         },
            //         hotClient: false
            //         // hotClient: {
            //         //     hmr: false,
            //         //     // reload: true,
            //         //     // host: {
            //         //     //     client: this._webPackDevMiddlewareClientHost,
            //         //     //     server: this._webPackDevMiddlewareServerHost || this._host
            //         //     // },
            //         //     // port: this._port
            //         // }
            //     }).then((middleware) => this._koa.use(middleware));
            // }
            // else
            // {
            //     // tslint:disable-next-line
            //     koaWebpack({
            //         devMiddleware: {
            //             publicPath: this._webPackDevMiddlewarePublicPath,
            //             writeToDisk: true,
            //         },
            //         hotClient: {
            //             hmr: false,
            //             // reload: true,
            //             // server: this._server
            //         }
            //     }).then((middleware) => this._koa.use(middleware));
            // }
        }
        return Promise.resolve();
    }
    configureShutDown() {
        // if (ConfigurationManager.getConfig<string>("env") === "dev")
        //     return;
        this.registerDisposeAction(() => {
            console.log("CLEANING UP. PLEASE WAIT...");
            return n_util_1.Delay.seconds(n_config_1.ConfigurationManager.getConfig("env") === "dev" ? 2 : 20);
        });
        const shutDown = (signal) => {
            if (this._isShutDown)
                return;
            this._isShutDown = true;
            this._server.close(() => __awaiter(this, void 0, void 0, function* () {
                console.warn(`SERVER STOPPING (${signal}).`);
                if (this._hasShutdownScript) {
                    console.log("Shutdown script executing.");
                    try {
                        yield this._container.resolve(this._shutdownScriptKey).run();
                        console.log("Shutdown script complete.");
                    }
                    catch (error) {
                        console.warn("Shutdown script error.");
                        console.error(error);
                    }
                }
                console.log("Dispose actions executing.");
                try {
                    yield Promise.all(this._disposeActions.map(t => t()));
                    console.log("Dispose actions complete.");
                }
                catch (error) {
                    console.warn("Dispose actions error.");
                    console.error(error);
                }
                console.warn(`SERVER STOPPED (${signal}).`);
                process.exit(0);
            }));
        };
        process.on("SIGTERM", () => shutDown("SIGTERM"));
        process.on("SIGINT", () => shutDown("SIGINT"));
    }
}
exports.WebApp = WebApp;
//# sourceMappingURL=web-app.js.map