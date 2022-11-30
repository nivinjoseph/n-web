"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebApp = void 0;
const tslib_1 = require("tslib");
const Koa = require("koa");
const KoaBodyParser = require("koa-bodyparser");
const n_ject_1 = require("@nivinjoseph/n-ject");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const router_1 = require("./router");
const n_exception_1 = require("@nivinjoseph/n-exception");
const serve = require("koa-static");
const fs = require("fs");
const path = require("path");
const cors = require("kcors");
const default_call_context_1 = require("./services/call-context/default-call-context");
const default_authorization_handler_1 = require("./security/default-authorization-handler");
const default_exception_handler_1 = require("./exceptions/default-exception-handler");
const http_exception_1 = require("./exceptions/http-exception");
const n_config_1 = require("@nivinjoseph/n-config");
const n_log_1 = require("@nivinjoseph/n-log");
const n_util_1 = require("@nivinjoseph/n-util");
const Http = require("http");
const backend_1 = require("@nivinjoseph/n-sock/dist/backend");
const Compress = require("koa-compress");
// public
class WebApp {
    constructor(port, host, container, logger) {
        this._callContextKey = "CallContext";
        // private _edaConfig: EdaConfig;
        // private _edaManager: EdaManager;
        // private _backgroundProcessor: BackgroundProcessor;
        // private readonly _jobRegistrations = new Array<Function>();
        // private readonly _jobInstances = new Array<Job>();
        this._exceptionHandlerKey = "$exceptionHandler";
        // private _hasExceptionHandler = false;
        this._authenticationHandlerKey = "$authenticationHandler";
        this._hasAuthenticationHandler = false;
        this._authHeaders = ["authorization"];
        this._authorizationHandlerKey = "$authorizationHandler";
        this._startupScriptKey = "$startupScript";
        this._hasStartupScript = false;
        this._shutdownScriptKey = "$shutdownScript";
        this._hasShutdownScript = false;
        this._staticFilePaths = new Array();
        this._enableCors = false;
        this._enableCompression = false;
        this._enableProfiling = false;
        this._viewResolutionRoot = null;
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
        (0, n_defensive_1.given)(port, "port").ensureHasValue().ensureIsNumber();
        this._port = port;
        (0, n_defensive_1.given)(host, "host").ensureIsString();
        this._host = host ? host.trim() : null;
        (0, n_defensive_1.given)(container, "container").ensureIsObject().ensureIsType(n_ject_1.Container);
        if (container == null) {
            this._container = new n_ject_1.Container();
            this._ownsContainer = true;
        }
        else {
            this._container = container;
            this._ownsContainer = false;
        }
        (0, n_defensive_1.given)(logger, "logger").ensureIsObject();
        this._logger = logger !== null && logger !== void 0 ? logger : new n_log_1.ConsoleLogger();
        this._koa = new Koa();
        this._router = new router_1.Router(this._koa, this._container, this._authorizationHandlerKey, this._callContextKey);
        this._container.registerScoped(this._callContextKey, default_call_context_1.DefaultCallContext);
        this._container.registerScoped(this._authorizationHandlerKey, default_authorization_handler_1.DefaultAuthorizationHandler);
        this._container.registerInstance(this._exceptionHandlerKey, new default_exception_handler_1.DefaultExceptionHandler(this._logger));
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
    enableProfiling() {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("enableProfiling");
        this._enableProfiling = true;
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
    registerStaticFilePath(filePath, cache = false, defer = false) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerStaticFilePaths");
        (0, n_defensive_1.given)(filePath, "filePath").ensureHasValue().ensureIsString();
        (0, n_defensive_1.given)(cache, "cache").ensureHasValue().ensureIsBoolean();
        (0, n_defensive_1.given)(defer, "defer").ensureHasValue().ensureIsBoolean();
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
        this._staticFilePaths.push({ path: filePath, cache, defer });
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
    // public useLogger(logger: Logger): this
    // {
    //     if (this._isBootstrapped)
    //         throw new InvalidOperationException("useLogger");
    //     given(logger, "logger").ensureHasValue().ensureIsObject();
    //     this._logger = logger;
    //     return this;
    // }
    useInstaller(installer) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerInstaller");
        (0, n_defensive_1.given)(installer, "installer").ensureHasValue();
        this._container.install(installer);
        return this;
    }
    registerStartupScript(applicationScriptClass) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerStartupScript");
        (0, n_defensive_1.given)(applicationScriptClass, "applicationScriptClass").ensureHasValue().ensureIsFunction();
        this._container.registerSingleton(this._startupScriptKey, applicationScriptClass);
        this._hasStartupScript = true;
        return this;
    }
    registerShutdownScript(applicationScriptClass) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerShutdownScript");
        (0, n_defensive_1.given)(applicationScriptClass, "applicationScriptClass").ensureHasValue().ensureIsFunction();
        this._container.registerSingleton(this._shutdownScriptKey, applicationScriptClass);
        this._hasShutdownScript = true;
        return this;
    }
    registerExceptionHandler(exceptionHandlerClass) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerExceptionHandler");
        (0, n_defensive_1.given)(exceptionHandlerClass, "exceptionHandlerClass").ensureHasValue().ensureIsFunction();
        this._container.deregister(this._exceptionHandlerKey);
        this._container.registerScoped(this._exceptionHandlerKey, exceptionHandlerClass);
        return this;
    }
    registerAuthenticationHandler(authenticationHandler, ...authHeaders) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerAuthenticationHandler");
        (0, n_defensive_1.given)(authenticationHandler, "authenticationHandler").ensureHasValue().ensureIsFunction();
        (0, n_defensive_1.given)(authHeaders, "authHeaders").ensureHasValue().ensureIsArray();
        this._container.registerScoped(this._authenticationHandlerKey, authenticationHandler);
        this._hasAuthenticationHandler = true;
        if (authHeaders.length > 0)
            this._authHeaders = authHeaders;
        return this;
    }
    registerAuthorizationHandler(authorizationHandler) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("registerAuthorizationHandler");
        (0, n_defensive_1.given)(authorizationHandler, "authorizationHandler").ensureHasValue();
        this._container.deregister(this._authorizationHandlerKey);
        this._container.registerScoped(this._authorizationHandlerKey, authorizationHandler);
        return this;
    }
    useViewResolutionRoot(path) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("useViewResolutionRoot");
        (0, n_defensive_1.given)(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._viewResolutionRoot = path.trim();
        return this;
    }
    enableWebSockets(corsOrigin, socketServerRedisClient) {
        if (this._isBootstrapped)
            throw new n_exception_1.InvalidOperationException("enableWebSockets");
        (0, n_defensive_1.given)(corsOrigin, "corsOrigin").ensureHasValue().ensureIsString();
        this._corsOrigin = corsOrigin.trim();
        (0, n_defensive_1.given)(socketServerRedisClient, "socketServerRedisClient").ensureHasValue().ensureIsObject();
        this._socketServerRedisClient = socketServerRedisClient;
        this._enableWebSockets = true;
        return this;
    }
    /**
     *
     * @param publicPath Webpack publicPath value
     * @description Requires dev dependencies [webpack-dev-middleware, webpack-hot-middleware]
     */
    enableWebPackDevMiddleware(publicPath = "/") {
        (0, n_defensive_1.given)(publicPath, "publicPath").ensureHasValue().ensureIsString();
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
        (0, n_defensive_1.given)(disposeAction, "disposeAction").ensureHasValue().ensureIsFunction();
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
        // if (!this._logger)
        //     this._logger = new ConsoleLogger();
        // this._backgroundProcessor = new BackgroundProcessor((e) => this._logger.logError(e as any));
        // this.registerDisposeAction(() => this._backgroundProcessor.dispose());
        this._configureCors();
        // this.configureEda();
        this._configureContainer();
        // this.initializeJobs();
        this._configureStartup()
            .then(() => {
            var _a;
            this._server = Http.createServer();
            // this.configureWebSockets();
            this._server.listen(this._port, (_a = this._host) !== null && _a !== void 0 ? _a : undefined);
            // this is the request response pipeline START
            this._configureScoping(); // must be first
            this._configureCallContext();
            this._configureCompression();
            this._configureExceptionHandling();
            this._configureErrorTrapping();
            this._configureAuthentication();
            this._configureStaticFileServing();
            return this._configureWebPackDevMiddleware();
        })
            .then(() => {
            this._configureBodyParser();
            this._configureRouting(); // must be last
            // this is the request response pipeline END
            const appEnv = n_config_1.ConfigurationManager.getConfig("env");
            const appName = n_config_1.ConfigurationManager.getConfig("package.name");
            const appVersion = n_config_1.ConfigurationManager.getConfig("package.version");
            const appDescription = n_config_1.ConfigurationManager.getConfig("package.description");
            console.log(`ENV: ${appEnv}; NAME: ${appName}; VERSION: ${appVersion}; DESCRIPTION: ${appDescription}.`);
            // this._server = Http.createServer(this._koa.callback());
            this._configureWebSockets();
            this._configureShutDown();
            this._server.on("request", this._koa.callback());
            // this._server.listen(this._port, this._host);
            // this.configureWebPackDevMiddleware();
            this._isBootstrapped = true;
            console.log("SERVER STARTED!");
        })
            .catch(e => {
            console.error("STARTUP FAILED!!!");
            console.error(e);
            throw e;
        });
    }
    _configureCors() {
        if (this._enableCors)
            this._koa.use(cors());
    }
    _configureContainer() {
        if (this._ownsContainer)
            this._container.bootstrap();
        this.registerDisposeAction(() => this._container.dispose());
    }
    _configureStartup() {
        console.log("SERVER STARTING...");
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
    _configureScoping() {
        this._koa.use((ctx, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (this._isShutDown) {
                ctx.response.status = 503;
                ctx.response.body = "SERVER UNAVAILABLE";
                return;
            }
            if (this._enableProfiling)
                ctx.state.profiler = new n_util_1.Profiler(ctx.request.URL.toString());
            (_a = ctx.state.profiler) === null || _a === void 0 ? void 0 : _a.trace("Request started");
            ctx.state.scope = this._container.createScope();
            (_b = ctx.state.profiler) === null || _b === void 0 ? void 0 : _b.trace("Request scope created");
            try {
                yield next();
            }
            finally {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                ctx.state.scope.dispose();
                (_c = ctx.state.profiler) === null || _c === void 0 ? void 0 : _c.trace("Request ended");
                if (this._enableProfiling) {
                    const profiler = ctx.state.profiler;
                    const totalTime = profiler.traces.reduce((acc, t) => acc + t.diffMs, 0);
                    console.log(profiler.id, `Total time: ${totalTime}`);
                    console.table(profiler.traces.map(t => ({
                        operation: t.message,
                        time: t.diffMs
                    })));
                    // console.table((<Profiler>ctx.state.profiler).traces);
                    // this._logger.logInfo((<Profiler>ctx.state.profiler).id + " ==> " + JSON.stringify((<Profiler>ctx.state.profiler).traces));
                }
            }
        }));
    }
    _configureCallContext() {
        this._koa.use((ctx, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            const scope = ctx.state.scope;
            const defaultCallContext = scope.resolve(this._callContextKey);
            defaultCallContext.configure(ctx, this._authHeaders);
            (_a = ctx.state.profiler) === null || _a === void 0 ? void 0 : _a.trace("Request callContext configured");
            yield next();
        }));
    }
    _configureCompression() {
        if (this._enableCompression)
            this._koa.use(Compress());
    }
    _configureExceptionHandling() {
        this._koa.use((ctx, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                yield next();
            }
            catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                yield this._logger.logWarning(`Error during request to URL '${(_a = ctx.url) !== null && _a !== void 0 ? _a : "UNKNOWN"}'.`);
                if (error instanceof http_exception_1.HttpException) {
                    ctx.status = error.statusCode;
                    if (error.body !== undefined && error.body !== null)
                        ctx.body = error.body;
                    return;
                }
                const scope = ctx.state.scope;
                const exceptionHandler = scope.resolve(this._exceptionHandlerKey);
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
    _configureErrorTrapping() {
        this._koa.use((_ctx, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                throw new n_exception_1.ApplicationException("TRAPPED ERROR | " + message);
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
    _configureAuthentication() {
        if (!this._hasAuthenticationHandler)
            return;
        this._koa.use((ctx, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            const scope = ctx.state.scope;
            const callContext = scope.resolve(this._callContextKey);
            if (callContext.hasAuth) {
                const authenticationHandler = scope.resolve(this._authenticationHandlerKey);
                const identity = yield authenticationHandler.authenticate(callContext.authScheme, callContext.authToken);
                if (identity != null) {
                    ctx.state.identity = identity;
                    (_a = ctx.state.profiler) === null || _a === void 0 ? void 0 : _a.trace("Request authenticated");
                }
            }
            yield next();
        }));
    }
    _configureStaticFileServing() {
        for (const item of this._staticFilePaths)
            this._koa.use(serve(item.path, {
                maxage: item.cache ? 1000 * 60 * 60 * 24 * 365 : undefined,
                defer: item.defer ? true : undefined
            }));
    }
    _configureBodyParser() {
        this._koa.use(KoaBodyParser({
            strict: true,
            jsonLimit: "250mb"
        }));
    }
    // this is the last
    _configureRouting() {
        var _a;
        this._router.configureRouting((_a = this._viewResolutionRoot) !== null && _a !== void 0 ? _a : undefined);
    }
    _configureWebSockets() {
        if (!this._enableWebSockets)
            return;
        this._socketServer = new backend_1.SocketServer(this._server, this._corsOrigin, this._socketServerRedisClient);
        // this.registerDisposeAction(() => this._socketServer!.dispose());
    }
    // private configureWebPackDevMiddleware(): Promise<void>
    // {
    //     if (ConfigurationManager.getConfig<string>("env") === "dev" && this._webPackDevMiddlewarePublicPath != null)
    //     {
    //         // // tslint:disable-next-line
    //         // koaWebpack({
    //         //     devMiddleware: {
    //         //         publicPath: this._webPackDevMiddlewarePublicPath,
    //         //         writeToDisk: true,
    //         //     },
    //         //     hotClient: false
    //         // }).then((middleware) => this._koa.use(middleware));
    //         // const koaWebpack = require("@nivinjoseph/koa-webpack");
    //         const koaWebpack = require("koa-webpack");
    //         // tslint:disable-next-line
    //         return koaWebpack({
    //             devMiddleware: {
    //                 publicPath: this._webPackDevMiddlewarePublicPath,
    //                 writeToDisk: false,
    //             },
    //             hotClient: {
    //                 hmr: true,
    //                 reload: true,
    //                 server: this._server
    //             }
    //         }).then((middleware: any) =>
    //         {
    //             this._koa.use(middleware);
    //             const HmrHelper = require("./hmr-helper").HmrHelper;
    //             HmrHelper.configure(middleware.devMiddleware.fileSystem);
    //         });
    //         // if (this._webPackDevMiddlewareClientHost)
    //         // {
    //         //     // tslint:disable-next-line
    //         //     koaWebpack({
    //         //         devMiddleware: {
    //         //             publicPath: this._webPackDevMiddlewarePublicPath,
    //         //             writeToDisk: true,
    //         //         },
    //         //         hotClient: false
    //         //         // hotClient: {
    //         //         //     hmr: false,
    //         //         //     // reload: true,
    //         //         //     // host: {
    //         //         //     //     client: this._webPackDevMiddlewareClientHost,
    //         //         //     //     server: this._webPackDevMiddlewareServerHost || this._host
    //         //         //     // },
    //         //         //     // port: this._port
    //         //         // }
    //         //     }).then((middleware) => this._koa.use(middleware));
    //         // }
    //         // else
    //         // {
    //         //     // tslint:disable-next-line
    //         //     koaWebpack({
    //         //         devMiddleware: {
    //         //             publicPath: this._webPackDevMiddlewarePublicPath,
    //         //             writeToDisk: true,
    //         //         },
    //         //         hotClient: {
    //         //             hmr: false,
    //         //             // reload: true,
    //         //             // server: this._server
    //         //         }
    //         //     }).then((middleware) => this._koa.use(middleware));
    //         // }
    //     }
    //     return Promise.resolve();
    // }
    _configureWebPackDevMiddleware() {
        if (n_config_1.ConfigurationManager.getConfig("env") === "dev" && this._webPackDevMiddlewarePublicPath != null) {
            const webpack = require("webpack");
            const webpackDevMiddleware = require("webpack-dev-middleware");
            const webpackHotMiddleware = require("webpack-hot-middleware");
            const config = require(path.resolve(process.cwd(), "webpack.config.js"));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const compiler = webpack(config);
            const HmrHelper = require("./hmr-helper").HmrHelper;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            HmrHelper.configure();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const devMiddleware = webpackDevMiddleware(compiler, {
                publicPath: this._webPackDevMiddlewarePublicPath,
                outputFileSystem: HmrHelper.devFs
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const hotMiddleware = webpackHotMiddleware(compiler, {
                hmr: true,
                reload: true,
                server: this._server
            });
            this._koa.use((ctx, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                // wait for webpack-dev-middleware to signal that the build is ready
                const ready = new Promise((resolve, reject) => {
                    var _a;
                    for (const comp of [].concat(compiler.compilers || compiler)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        (_a = comp.hooks) === null || _a === void 0 ? void 0 : _a.failed.tap("n-web-webpack-dev-middleware", (error) => {
                            reject(error);
                        });
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    devMiddleware.waitUntilValid(() => {
                        resolve(true);
                    });
                });
                // tell webpack-dev-middleware to handle the request
                const init = new Promise((resolve) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    devMiddleware(ctx.req, {
                        end: (content) => {
                            // eslint-disable-next-line no-param-reassign
                            ctx.body = content;
                            resolve();
                        },
                        getHeader: ctx.get.bind(ctx),
                        setHeader: ctx.set.bind(ctx),
                        locals: ctx.state
                    }, () => resolve(next()));
                });
                return Promise.all([ready, init]);
            }));
            this._koa.use((ctx, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const init = new Promise((resolve) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    hotMiddleware(ctx.req, ctx.res, () => resolve(next()));
                });
                return init;
            }));
            const disposeAction = () => {
                return new Promise((resolve, reject) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    hotMiddleware.close();
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    devMiddleware.close((err) => {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                });
            };
            this._disposeActions.push(disposeAction);
        }
        return Promise.resolve();
    }
    _configureShutDown() {
        // if (ConfigurationManager.getConfig<string>("env") === "dev")
        //     return;
        this.registerDisposeAction(() => {
            console.log("CLEANING UP. PLEASE WAIT...");
            // return Delay.seconds(ConfigurationManager.getConfig<string>("env") === "dev" ? 2 : 20);
            return Promise.resolve();
        });
        const shutDown = (signal) => {
            var _a, _b;
            if (this._isShutDown)
                return;
            this._isShutDown = true;
            ((_b = (_a = this._socketServer) === null || _a === void 0 ? void 0 : _a.dispose()) !== null && _b !== void 0 ? _b : Promise.resolve())
                .catch((e) => console.error(e))
                .finally(() => {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                n_util_1.Delay.seconds(n_config_1.ConfigurationManager.getConfig("env") === "dev" ? 2 : 15).then(() => {
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    this._server.close(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                });
            });
        };
        process.on("SIGTERM", () => shutDown("SIGTERM"));
        process.on("SIGINT", () => shutDown("SIGINT"));
    }
}
exports.WebApp = WebApp;
//# sourceMappingURL=web-app.js.map