import { ConfigurationManager } from "@nivinjoseph/n-config";
import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException, ArgumentException, InvalidOperationException } from "@nivinjoseph/n-exception";
import { Container } from "@nivinjoseph/n-ject";
import { ConsoleLogger } from "@nivinjoseph/n-log";
import { SocketServer } from "@nivinjoseph/n-sock/server";
import { ShutdownManager } from "@nivinjoseph/n-svc";
import { Delay } from "@nivinjoseph/n-util";
import cors from "kcors";
import Koa from "koa";
import KoaBodyParser from "koa-bodyparser";
import Compress from "koa-compress";
import serve from "koa-static";
import fs from "node:fs";
import Http from "node:http";
import path from "node:path";
import { Controller } from "./controller.js";
import { DefaultExceptionHandler } from "./exceptions/default-exception-handler.js";
import { HttpException } from "./exceptions/http-exception.js";
import { Router } from "./router.js";
import { DefaultAuthorizationHandler } from "./security/default-authorization-handler.js";
import { DefaultCallContext } from "./services/call-context/default-call-context.js";
import { HealthCheckController } from "./controllers/health-check-controller.js";
// public
export class WebApp {
    _port;
    _host;
    _koa;
    _container;
    _ownsContainer;
    _router;
    _callContextKey = "CallContext";
    // private _edaConfig: EdaConfig;
    // private _edaManager: EdaManager;
    // private _backgroundProcessor: BackgroundProcessor;
    // private readonly _jobRegistrations = new Array<Function>();
    // private readonly _jobInstances = new Array<Job>();
    _exceptionHandlerKey = "$exceptionHandler";
    // private _hasExceptionHandler = false;
    _authenticationHandlerKey = "$authenticationHandler";
    _hasAuthenticationHandler = false;
    _authHeaders = ["authorization"];
    _authorizationHandlerKey = "$authorizationHandler";
    // private _hasAuthorizationHandler = false;
    _logger;
    _startupScriptKey = "$startupScript";
    _hasStartupScript = false;
    _shutdownScriptKey = "$shutdownScript";
    _hasShutdownScript = false;
    _staticFilePaths = new Array();
    _enableCors = false;
    _enableCompression = false;
    _viewResolutionRoot = null;
    _enableWebSockets = false;
    _corsOrigin = null;
    _socketServerRedisClient = null;
    _socketServer = null;
    _disposeActions = new Array();
    _server;
    _isBootstrapped = false;
    _shutdownManager = null;
    _serverClosed = false;
    get containerRegistry() { return this._container; }
    constructor(port, host, container, logger) {
        given(port, "port").ensureHasValue().ensureIsNumber();
        this._port = port;
        given(host, "host").ensureIsString();
        this._host = host ? host.trim() : null;
        given(container, "container").ensureIsObject().ensureIsType(Container);
        if (container == null) {
            this._container = new Container();
            this._ownsContainer = true;
        }
        else {
            this._container = container;
            this._ownsContainer = false;
        }
        given(logger, "logger").ensureIsObject();
        this._logger = logger ?? new ConsoleLogger({
            useJsonFormat: ConfigurationManager.getConfig("env") !== "dev"
        });
        this._koa = new Koa();
        this._router = new Router(this._koa, this._container, this._authorizationHandlerKey, this._callContextKey);
        this._router.registerControllers(HealthCheckController);
        this._container.registerScoped(this._callContextKey, DefaultCallContext);
        this._container.registerScoped(this._authorizationHandlerKey, DefaultAuthorizationHandler);
        this._container.registerInstance(this._exceptionHandlerKey, new DefaultExceptionHandler(this._logger));
    }
    enableCors() {
        if (this._isBootstrapped)
            throw new InvalidOperationException("enableCors");
        this._enableCors = true;
        return this;
    }
    enableCompression() {
        if (this._isBootstrapped)
            throw new InvalidOperationException("enableCompression");
        this._enableCompression = true;
        return this;
    }
    registerStaticFilePath(filePath, cache = false, defer = false) {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerStaticFilePaths");
        given(filePath, "filePath").ensureHasValue().ensureIsString();
        given(cache, "cache").ensureHasValue().ensureIsBoolean();
        given(defer, "defer").ensureHasValue().ensureIsBoolean();
        filePath = filePath.trim();
        if (filePath.startsWith("/")) {
            if (filePath.length === 1) {
                throw new ArgumentException("filePath[{0}]".format(filePath), "is root");
            }
            filePath = filePath.substr(1);
        }
        filePath = path.join(process.cwd(), filePath);
        // We skip the defensive check in dev because of webpack HMR
        if (ConfigurationManager.getConfig("env") !== "dev") {
            if (!fs.existsSync(filePath))
                throw new ArgumentException("filePath[{0}]".format(filePath), "does not exist");
        }
        if (this._staticFilePaths.some(t => t.path === filePath))
            throw new ArgumentException("filePath[{0}]".format(filePath), "is duplicate");
        this._staticFilePaths.push({ path: filePath, cache, defer });
        return this;
    }
    registerControllers(...controllerClasses) {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerControllers");
        this._router.registerControllers(...controllerClasses);
        return this;
    }
    useInstaller(installer) {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerInstaller");
        given(installer, "installer").ensureHasValue();
        this._container.install(installer);
        return this;
    }
    registerStartupScript(applicationScriptClass) {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerStartupScript");
        given(applicationScriptClass, "applicationScriptClass").ensureHasValue().ensureIsFunction();
        this._container.registerSingleton(this._startupScriptKey, applicationScriptClass);
        this._hasStartupScript = true;
        return this;
    }
    registerShutdownScript(applicationScriptClass) {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerShutdownScript");
        given(applicationScriptClass, "applicationScriptClass").ensureHasValue().ensureIsFunction();
        this._container.registerSingleton(this._shutdownScriptKey, applicationScriptClass);
        this._hasShutdownScript = true;
        return this;
    }
    registerExceptionHandler(exceptionHandlerClass) {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerExceptionHandler");
        given(exceptionHandlerClass, "exceptionHandlerClass").ensureHasValue().ensureIsFunction();
        this._container.deregister(this._exceptionHandlerKey);
        this._container.registerScoped(this._exceptionHandlerKey, exceptionHandlerClass);
        return this;
    }
    registerAuthenticationHandler(authenticationHandler, ...authHeaders) {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerAuthenticationHandler");
        given(authenticationHandler, "authenticationHandler").ensureHasValue().ensureIsFunction();
        given(authHeaders, "authHeaders").ensureHasValue().ensureIsArray();
        this._container.registerScoped(this._authenticationHandlerKey, authenticationHandler);
        this._hasAuthenticationHandler = true;
        if (authHeaders.length > 0)
            this._authHeaders = authHeaders;
        return this;
    }
    registerAuthorizationHandler(authorizationHandler) {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerAuthorizationHandler");
        given(authorizationHandler, "authorizationHandler").ensureHasValue();
        this._container.deregister(this._authorizationHandlerKey);
        this._container.registerScoped(this._authorizationHandlerKey, authorizationHandler);
        return this;
    }
    useViewResolutionRoot(path) {
        if (this._isBootstrapped)
            throw new InvalidOperationException("useViewResolutionRoot");
        given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._viewResolutionRoot = path.trim();
        return this;
    }
    enableWebSockets(corsOrigin, socketServerRedisClient) {
        if (this._isBootstrapped)
            throw new InvalidOperationException("enableWebSockets");
        given(corsOrigin, "corsOrigin").ensureHasValue().ensureIsString();
        this._corsOrigin = corsOrigin.trim();
        given(socketServerRedisClient, "socketServerRedisClient").ensureHasValue().ensureIsObject();
        this._socketServerRedisClient = socketServerRedisClient;
        this._enableWebSockets = true;
        return this;
    }
    registerDisposeAction(disposeAction) {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerForDispose");
        given(disposeAction, "disposeAction").ensureHasValue().ensureIsFunction();
        this._disposeActions.push(() => {
            return new Promise((resolve) => {
                try {
                    disposeAction()
                        .then(() => resolve())
                        .catch((e) => {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        this._logger.logError(e).finally(() => resolve());
                    });
                }
                catch (error) {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this._logger.logError(error).finally(() => resolve());
                }
            });
        });
        return this;
    }
    bootstrap() {
        if (this._isBootstrapped)
            throw new InvalidOperationException("bootstrap");
        this._configureCors();
        this._configureContainer();
        this._configureStartup()
            .then(() => {
            this._server = Http.createServer();
            this._server.listen(this._port, this._host ?? undefined);
            this._server.on("close", () => {
                this._serverClosed = true;
            });
            // this is the request response pipeline START
            this._configureScoping(); // must be first
            this._configureCallContext();
            this._configureCompression();
            this._configureExceptionHandling();
            this._configureErrorTrapping();
            this._configureAuthentication();
            this._configureStaticFileServing();
        })
            .then(async () => {
            this._configureBodyParser();
            this._configureRouting(); // must be last
            // this is the request response pipeline END
            const appEnv = ConfigurationManager.getConfig("env");
            const appName = ConfigurationManager.getConfig("package.name");
            const appVersion = ConfigurationManager.getConfig("package.version");
            const appDescription = ConfigurationManager.getConfig("package.description");
            await this._logger.logInfo(`ENV: ${appEnv}; NAME: ${appName}; VERSION: ${appVersion}; DESCRIPTION: ${appDescription}.`);
            // this._server = Http.createServer(this._koa.callback());
            this._configureWebSockets();
            this._configureShutDown();
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this._server.on("request", this._koa.callback());
            this._isBootstrapped = true;
            await this._logger.logInfo("WEB SERVER STARTED");
        })
            .catch(async (e) => {
            await this._logger.logWarning("WEB SERVER STARTUP FAILED");
            await this._logger.logError(e);
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
    async _configureStartup() {
        await this._logger.logInfo("WEB SERVER STARTING...");
        if (this._hasStartupScript)
            await this._container.resolve(this._startupScriptKey).run();
    }
    // this is the first
    _configureScoping() {
        this._koa.use(async (ctx, next) => {
            if (this._shutdownManager == null || this._shutdownManager.isShutdown) {
                ctx.response.status = 503;
                ctx.response.body = "SERVER UNAVAILABLE";
                return;
            }
            ctx.state.scope = this._container.createScope();
            try {
                await next();
            }
            finally {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                ctx.state.scope.dispose();
            }
        });
    }
    _configureCallContext() {
        this._koa.use(async (ctx, next) => {
            const scope = ctx.state.scope;
            const defaultCallContext = scope.resolve(this._callContextKey);
            defaultCallContext.configure(ctx, this._authHeaders);
            await next();
        });
    }
    _configureCompression() {
        if (this._enableCompression)
            this._koa.use(Compress());
    }
    _configureExceptionHandling() {
        this._koa.use(async (ctx, next) => {
            try {
                await next();
            }
            catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                await this._logger.logWarning(`Error during request to URL '${ctx.url ?? "UNKNOWN"}'.`);
                await this._logger.logWarning(error);
                if (error instanceof HttpException) {
                    ctx.status = error.statusCode;
                    if (error.body !== undefined && error.body !== null)
                        ctx.body = error.body;
                    return;
                }
                const scope = ctx.state.scope;
                const exceptionHandler = scope.resolve(this._exceptionHandlerKey);
                try {
                    const result = await exceptionHandler.handle(error);
                    ctx.body = result;
                }
                catch (exp) {
                    if (exp instanceof HttpException) {
                        const httpExp = exp;
                        ctx.status = httpExp.statusCode;
                        if (httpExp.body !== undefined && httpExp.body !== null)
                            ctx.body = httpExp.body;
                    }
                    else {
                        await this._logger.logError(exp);
                        ctx.status = 500;
                        ctx.body = "There was an error processing your request.";
                    }
                }
            }
        });
    }
    _configureErrorTrapping() {
        this._koa.use(async (_ctx, next) => {
            try {
                await next();
            }
            catch (error) {
                if (error instanceof Error)
                    throw error;
                let message = error.toString();
                if (message === "[object Object]") {
                    console.error(error);
                    message = JSON.stringify(error);
                }
                throw new ApplicationException("TRAPPED ERROR | " + message);
            }
        });
    }
    _configureAuthentication() {
        if (!this._hasAuthenticationHandler)
            return;
        this._koa.use(async (ctx, next) => {
            const scope = ctx.state.scope;
            const callContext = scope.resolve(this._callContextKey);
            if (callContext.hasAuth) {
                const authenticationHandler = scope.resolve(this._authenticationHandlerKey);
                const identity = await authenticationHandler.authenticate(callContext.authScheme, callContext.authToken);
                if (identity != null) {
                    ctx.state.identity = identity;
                }
            }
            await next();
        });
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
        this._router.configureRouting(this._viewResolutionRoot ?? undefined);
    }
    _configureWebSockets() {
        if (!this._enableWebSockets)
            return;
        this._socketServer = new SocketServer(this._server, this._corsOrigin, this._socketServerRedisClient);
    }
    _configureShutDown() {
        this.registerDisposeAction(async () => {
            await this._logger.logInfo("CLEANING UP. PLEASE WAIT...");
            // return Delay.seconds(ConfigurationManager.getConfig<string>("env") === "dev" ? 2 : 20);
        });
        this._shutdownManager = new ShutdownManager(this._logger, [
            async () => {
                const seconds = ConfigurationManager.getConfig("env") === "dev" ? 2 : 15;
                await this._logger.logInfo(`BEGINNING WAIT (${seconds}S) FOR CONNECTION DRAIN...`);
                await Delay.seconds(seconds);
                await this._logger.logInfo("CONNECTION DRAIN COMPLETE");
            },
            async () => {
                if (this._socketServer) {
                    await this._logger.logInfo("CLOSING SOCKET SERVER...");
                    try {
                        await this._socketServer.dispose();
                        await this._logger.logInfo("SOCKET SERVER CLOSED");
                    }
                    catch (error) {
                        await this._logger.logWarning("SOCKET SERVER CLOSED WITH ERROR");
                        await this._logger.logError(error);
                    }
                }
            },
            () => {
                return new Promise((resolve, reject) => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this._logger.logInfo("CLOSING WEB SERVER...").finally(async () => {
                        if (!this._serverClosed) {
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises
                            this._server.close(async (err) => {
                                if (err) {
                                    await this._logger.logWarning("WEB SERVER CLOSED WITH ERROR");
                                    await this._logger.logError(err);
                                    reject(err);
                                    return;
                                }
                                await this._logger.logInfo("WEB SERVER CLOSED");
                                resolve();
                            });
                        }
                        else {
                            await this._logger.logInfo("WEB SERVER CLOSED");
                            resolve();
                        }
                    });
                });
            },
            async () => {
                if (this._hasShutdownScript) {
                    await this._logger.logInfo("SHUTDOWN SCRIPT EXECUTING...");
                    try {
                        await this._container.resolve(this._shutdownScriptKey).run();
                        await this._logger.logInfo("SHUTDOWN SCRIPT COMPLETE");
                    }
                    catch (error) {
                        await this._logger.logWarning("SHUTDOWN SCRIPT ERROR");
                        await this._logger.logError(error);
                    }
                }
            },
            async () => {
                await this._logger.logInfo("DISPOSE ACTIONS EXECUTING...");
                try {
                    await Promise.allSettled(this._disposeActions.map(t => t()));
                    await this._logger.logInfo("DISPOSE ACTIONS COMPLETE");
                }
                catch (error) {
                    await this._logger.logWarning("DISPOSE ACTIONS ERROR");
                    await this._logger.logError(error);
                }
            }
        ]);
    }
}
//# sourceMappingURL=web-app.js.map