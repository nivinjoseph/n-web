import { ConfigurationManager } from "@nivinjoseph/n-config";
import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException, ArgumentException, InvalidOperationException } from "@nivinjoseph/n-exception";
import { Container, type ComponentInstaller, type Registry, type Scope } from "@nivinjoseph/n-ject";
import { ConsoleLogger, type Logger } from "@nivinjoseph/n-log";
import { SocketServer } from "@nivinjoseph/n-sock/server";
import { ShutdownManager } from "@nivinjoseph/n-svc";
import { Delay, type ClassHierarchy } from "@nivinjoseph/n-util";
import cors from "kcors";
import Koa from "koa";
import KoaBodyParser from "koa-bodyparser";
import Compress from "koa-compress";
import serve from "koa-static";
import fs from "node:fs";
import Http from "node:http";
import path from "node:path";
import type { RedisClientType } from "redis";
import type { ApplicationScript } from "./application-script.js";
import { Controller } from "./controller.js";
import { DefaultExceptionHandler } from "./exceptions/default-exception-handler.js";
import type { ExceptionHandler } from "./exceptions/exception-handler.js";
import { HttpException } from "./exceptions/http-exception.js";
import { Router } from "./router.js";
import type { AuthenticationHandler } from "./security/authentication-handler.js";
import type { AuthorizationHandler } from "./security/authorization-handler.js";
import { DefaultAuthorizationHandler } from "./security/default-authorization-handler.js";
import type { CallContext } from "./services/call-context/call-context.js";
import { DefaultCallContext } from "./services/call-context/default-call-context.js";
import { HealthCheckController } from "./controllers/health-check-controller.js";


// public
export class WebApp
{
    private readonly _port: number;
    private readonly _host: string | null;
    private readonly _koa: Koa;
    private readonly _container: Container;
    private readonly _ownsContainer: boolean;
    private readonly _router: Router;

    private readonly _callContextKey = "CallContext";

    // private _edaConfig: EdaConfig;
    // private _edaManager: EdaManager;

    // private _backgroundProcessor: BackgroundProcessor;

    // private readonly _jobRegistrations = new Array<Function>();
    // private readonly _jobInstances = new Array<Job>();

    private readonly _exceptionHandlerKey = "$exceptionHandler";
    // private _hasExceptionHandler = false;

    private readonly _authenticationHandlerKey = "$authenticationHandler";
    private _hasAuthenticationHandler = false;
    private _authHeaders = ["authorization"];

    private readonly _authorizationHandlerKey = "$authorizationHandler";
    // private _hasAuthorizationHandler = false;

    private readonly _logger: Logger;

    private readonly _startupScriptKey = "$startupScript";
    private _hasStartupScript = false;

    private readonly _shutdownScriptKey = "$shutdownScript";
    private _hasShutdownScript = false;


    private readonly _staticFilePaths = new Array<{ path: string; cache: boolean; defer: boolean; }>();
    private _enableCors = false;
    private _enableCompression = false;
    private _viewResolutionRoot: string | null = null;

    private _enableWebSockets = false;
    private _corsOrigin: string | null = null;
    private _socketServerRedisClient: RedisClientType<any, any, any, any, any> | null = null;
    private _socketServer: SocketServer | null = null;

    private readonly _disposeActions = new Array<() => Promise<void>>();
    private _server!: Http.Server;
    private _isBootstrapped = false;

    private _shutdownManager: ShutdownManager | null = null;
    private _serverClosed = false;


    public get containerRegistry(): Registry { return this._container; }


    public constructor(port: number, host: string | null, container?: Container | null, logger?: Logger | null)
    {
        given(port, "port").ensureHasValue().ensureIsNumber();
        this._port = port;

        given(host as string, "host").ensureIsString();
        this._host = host ? host.trim() : null;

        given(container as Container, "container").ensureIsObject().ensureIsType(Container);
        if (container == null)
        {
            this._container = new Container();
            this._ownsContainer = true;
        }
        else
        {
            this._container = container;
            this._ownsContainer = false;
        }

        given(logger as Logger, "logger").ensureIsObject();
        this._logger = logger ?? new ConsoleLogger({
            useJsonFormat: ConfigurationManager.getConfig<string>("env") !== "dev"
        });

        this._koa = new Koa();

        this._router = new Router(this._koa, this._container, this._authorizationHandlerKey, this._callContextKey);
        this._router.registerControllers(HealthCheckController);

        this._container.registerScoped(this._callContextKey, DefaultCallContext);
        this._container.registerScoped(this._authorizationHandlerKey, DefaultAuthorizationHandler);
        this._container.registerInstance(this._exceptionHandlerKey, new DefaultExceptionHandler(this._logger));
    }


    public enableCors(): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("enableCors");

        this._enableCors = true;
        return this;
    }

    public enableCompression(): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("enableCompression");

        this._enableCompression = true;
        return this;
    }

    public registerStaticFilePath(filePath: string, cache = false, defer = false): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerStaticFilePaths");

        given(filePath, "filePath").ensureHasValue().ensureIsString();
        given(cache, "cache").ensureHasValue().ensureIsBoolean();
        given(defer, "defer").ensureHasValue().ensureIsBoolean();

        filePath = filePath.trim();
        if (filePath.startsWith("/"))
        {
            if (filePath.length === 1)
            {
                throw new ArgumentException("filePath[{0}]".format(filePath), "is root");
            }
            filePath = filePath.substr(1);
        }

        filePath = path.join(process.cwd(), filePath);

        // We skip the defensive check in dev because of webpack HMR
        if (ConfigurationManager.getConfig<string>("env") !== "dev")
        {
            if (!fs.existsSync(filePath))
                throw new ArgumentException("filePath[{0}]".format(filePath), "does not exist");
        }

        if (this._staticFilePaths.some(t => t.path === filePath))
            throw new ArgumentException("filePath[{0}]".format(filePath), "is duplicate");

        this._staticFilePaths.push({ path: filePath, cache, defer });

        return this;
    }

    public registerControllers(...controllerClasses: ReadonlyArray<ClassHierarchy<Controller>>): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerControllers");

        this._router.registerControllers(...controllerClasses);
        return this;
    }

    public useInstaller(installer: ComponentInstaller): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerInstaller");

        given(installer, "installer").ensureHasValue();
        this._container.install(installer);
        return this;
    }

    public registerStartupScript(applicationScriptClass: ClassHierarchy<ApplicationScript>): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerStartupScript");

        given(applicationScriptClass, "applicationScriptClass").ensureHasValue().ensureIsFunction();

        this._container.registerSingleton(this._startupScriptKey, applicationScriptClass);
        this._hasStartupScript = true;
        return this;
    }

    public registerShutdownScript(applicationScriptClass: ClassHierarchy<ApplicationScript>): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerShutdownScript");

        given(applicationScriptClass, "applicationScriptClass").ensureHasValue().ensureIsFunction();

        this._container.registerSingleton(this._shutdownScriptKey, applicationScriptClass);
        this._hasShutdownScript = true;
        return this;
    }

    public registerExceptionHandler(exceptionHandlerClass: ClassHierarchy<ExceptionHandler>): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerExceptionHandler");

        given(exceptionHandlerClass, "exceptionHandlerClass").ensureHasValue().ensureIsFunction();
        this._container.deregister(this._exceptionHandlerKey);
        this._container.registerScoped(this._exceptionHandlerKey, exceptionHandlerClass);
        return this;
    }

    public registerAuthenticationHandler(authenticationHandler: ClassHierarchy<AuthenticationHandler>,
        ...authHeaders: Array<string>): this
    {
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

    public registerAuthorizationHandler(authorizationHandler: ClassHierarchy<AuthorizationHandler>): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerAuthorizationHandler");

        given(authorizationHandler, "authorizationHandler").ensureHasValue();
        this._container.deregister(this._authorizationHandlerKey);
        this._container.registerScoped(this._authorizationHandlerKey, authorizationHandler);
        return this;
    }

    public useViewResolutionRoot(path: string): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("useViewResolutionRoot");

        given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._viewResolutionRoot = path.trim();
        return this;
    }

    public enableWebSockets(corsOrigin: string, socketServerRedisClient: RedisClientType<any, any, any, any, any>): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("enableWebSockets");

        given(corsOrigin, "corsOrigin").ensureHasValue().ensureIsString();
        this._corsOrigin = corsOrigin.trim();

        given(socketServerRedisClient, "socketServerRedisClient").ensureHasValue().ensureIsObject();
        this._socketServerRedisClient = socketServerRedisClient;

        this._enableWebSockets = true;

        return this;
    }

    public registerDisposeAction(disposeAction: () => Promise<void>): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerForDispose");

        given(disposeAction, "disposeAction").ensureHasValue().ensureIsFunction();

        this._disposeActions.push(() =>
        {
            return new Promise((resolve) =>
            {
                try
                {
                    disposeAction()
                        .then(() => resolve())
                        .catch((e) =>
                        {
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            this._logger.logError(e).finally(() => resolve());
                        });
                }
                catch (error)
                {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this._logger.logError(error as any).finally(() => resolve());
                }
            });
        });
        return this;
    }

    public bootstrap(): void
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("bootstrap");

        this._configureCors();
        this._configureContainer();
        this._configureStartup()
            .then(() =>
            {
                this._server = Http.createServer();
                this._server.listen(this._port, this._host ?? undefined);
                this._server.on("close", () =>
                {
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
            .then(async () =>
            {
                this._configureBodyParser();
                this._configureRouting(); // must be last
                // this is the request response pipeline END

                const appEnv = ConfigurationManager.getConfig<string>("env");
                const appName = ConfigurationManager.getConfig<string>("package.name");
                const appVersion = ConfigurationManager.getConfig<string>("package.version");
                const appDescription = ConfigurationManager.getConfig<string>("package.description");

                await this._logger.logInfo(`ENV: ${appEnv}; NAME: ${appName}; VERSION: ${appVersion}; DESCRIPTION: ${appDescription}.`);
                // this._server = Http.createServer(this._koa.callback());
                this._configureWebSockets();
                this._configureShutDown();

                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                this._server.on("request", this._koa.callback());

                this._isBootstrapped = true;
                await this._logger.logInfo("WEB SERVER STARTED");
            })
            .catch(async e =>
            {
                await this._logger.logWarning("WEB SERVER STARTUP FAILED");
                await this._logger.logError(e);
                throw e;
            });
    }


    private _configureCors(): void
    {
        if (this._enableCors)
            this._koa.use(cors());
    }

    private _configureContainer(): void
    {
        if (this._ownsContainer)
            this._container.bootstrap();

        this.registerDisposeAction(() => this._container.dispose());
    }

    private async _configureStartup(): Promise<void>
    {
        await this._logger.logInfo("WEB SERVER STARTING...");

        if (this._hasStartupScript)
            await this._container.resolve<ApplicationScript>(this._startupScriptKey).run();
    }

    // this is the first
    private _configureScoping(): void
    {
        this._koa.use(async (ctx, next) =>
        {
            if (this._shutdownManager == null || this._shutdownManager.isShutdown)
            {
                ctx.response.status = 503;
                ctx.response.body = "SERVER UNAVAILABLE";
                return;
            }

            ctx.state.scope = this._container.createScope();
            try
            {
                await next();
            }
            finally
            {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                (<Scope>ctx.state.scope).dispose();
            }
        });
    }

    private _configureCallContext(): void
    {
        this._koa.use(async (ctx, next) =>
        {
            const scope: Scope = ctx.state.scope;
            const defaultCallContext = scope.resolve<DefaultCallContext>(this._callContextKey);
            defaultCallContext.configure(ctx as any, this._authHeaders);
            await next();
        });
    }

    private _configureCompression(): void
    {
        if (this._enableCompression)
            this._koa.use(Compress());
    }

    private _configureExceptionHandling(): void
    {
        this._koa.use(async (ctx, next) =>
        {
            try
            {
                await next();
            }
            catch (error)
            {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                await this._logger.logWarning(`Error during request to URL '${ctx.url ?? "UNKNOWN"}'.`);
                await this._logger.logWarning(error as any);

                if (error instanceof HttpException)
                {
                    ctx.status = error.statusCode;
                    if (error.body !== undefined && error.body !== null)
                        ctx.body = error.body;

                    return;
                }

                const scope = ctx.state.scope as Scope;
                const exceptionHandler = scope.resolve<ExceptionHandler>(this._exceptionHandlerKey);

                try
                {
                    const result = await exceptionHandler.handle(error as any);
                    ctx.body = result;
                }
                catch (exp)
                {
                    if (exp instanceof HttpException)
                    {
                        const httpExp: HttpException = exp;
                        ctx.status = httpExp.statusCode;
                        if (httpExp.body !== undefined && httpExp.body !== null)
                            ctx.body = httpExp.body;
                    }
                    else
                    {
                        await this._logger.logError(exp as any);

                        ctx.status = 500;
                        ctx.body = "There was an error processing your request.";
                    }
                }
            }
        });
    }

    private _configureErrorTrapping(): void
    {
        this._koa.use(async (_ctx, next) =>
        {
            try
            {
                await next();
            }
            catch (error)
            {
                if (error instanceof Error)
                    throw error;

                let message = (<object>error).toString();
                if (message === "[object Object]")
                {
                    console.error(error);
                    message = JSON.stringify(error);
                }

                throw new ApplicationException("TRAPPED ERROR | " + message);
            }
        });
    }

    private _configureAuthentication(): void
    {
        if (!this._hasAuthenticationHandler)
            return;

        this._koa.use(async (ctx, next) =>
        {
            const scope = ctx.state.scope as Scope;
            const callContext = scope.resolve<CallContext>(this._callContextKey);
            if (callContext.hasAuth)
            {
                const authenticationHandler = scope.resolve<AuthenticationHandler>(this._authenticationHandlerKey);
                const identity = await authenticationHandler.authenticate(callContext.authScheme!, callContext.authToken!);
                if (identity != null)
                {
                    ctx.state.identity = identity;
                }
            }

            await next();
        });
    }

    private _configureStaticFileServing(): void
    {
        for (const item of this._staticFilePaths)
            this._koa.use(serve(item.path, {
                maxage: item.cache ? 1000 * 60 * 60 * 24 * 365 : undefined,
                defer: item.defer ? true : undefined
            }));
    }

    private _configureBodyParser(): void
    {
        this._koa.use(KoaBodyParser({
            strict: true,
            jsonLimit: "250mb"
        }));
    }

    // this is the last
    private _configureRouting(): void
    {
        this._router.configureRouting(this._viewResolutionRoot ?? undefined);
    }

    private _configureWebSockets(): void
    {
        if (!this._enableWebSockets)
            return;

        this._socketServer = new SocketServer(this._server, this._corsOrigin!, this._socketServerRedisClient!);
    }

    private _configureShutDown(): void
    {
        this.registerDisposeAction(async () =>
        {
            await this._logger.logInfo("CLEANING UP. PLEASE WAIT...");
            // return Delay.seconds(ConfigurationManager.getConfig<string>("env") === "dev" ? 2 : 20);
        });

        this._shutdownManager = new ShutdownManager(this._logger, [
            async (): Promise<void> =>
            {
                const seconds = ConfigurationManager.getConfig<string>("env") === "dev" ? 2 : 15;
                await this._logger.logInfo(`BEGINNING WAIT (${seconds}S) FOR CONNECTION DRAIN...`);
                await Delay.seconds(seconds);
                await this._logger.logInfo("CONNECTION DRAIN COMPLETE");
            },
            async (): Promise<void> =>
            {
                if (this._socketServer)
                {
                    await this._logger.logInfo("CLOSING SOCKET SERVER...");
                    try
                    {
                        await this._socketServer.dispose();
                        await this._logger.logInfo("SOCKET SERVER CLOSED");
                    }
                    catch (error)
                    {
                        await this._logger.logWarning("SOCKET SERVER CLOSED WITH ERROR");
                        await this._logger.logError(error as any);
                    }
                }
            },
            (): Promise<void> =>
            {
                return new Promise((resolve, reject) =>
                {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this._logger.logInfo("CLOSING WEB SERVER...").finally(async () =>
                    {
                        if (!this._serverClosed)
                        {
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises
                            this._server.close(async (err) =>
                            {
                                if (err)
                                {
                                    await this._logger.logWarning("WEB SERVER CLOSED WITH ERROR");
                                    await this._logger.logError(err as any);
                                    reject(err);
                                    return;
                                }
                                await this._logger.logInfo("WEB SERVER CLOSED");
                                resolve();
                            });
                        }
                        else
                        {
                            await this._logger.logInfo("WEB SERVER CLOSED");
                            resolve();
                        }
                    });

                });
            },
            async (): Promise<void> =>
            {
                if (this._hasShutdownScript)
                {
                    await this._logger.logInfo("SHUTDOWN SCRIPT EXECUTING...");
                    try
                    {
                        await this._container.resolve<ApplicationScript>(this._shutdownScriptKey).run();
                        await this._logger.logInfo("SHUTDOWN SCRIPT COMPLETE");
                    }
                    catch (error)
                    {
                        await this._logger.logWarning("SHUTDOWN SCRIPT ERROR");
                        await this._logger.logError(error as any);
                    }
                }
            },
            async (): Promise<void> =>
            {
                await this._logger.logInfo("DISPOSE ACTIONS EXECUTING...");
                try
                {
                    await Promise.allSettled(this._disposeActions.map(t => t()));
                    await this._logger.logInfo("DISPOSE ACTIONS COMPLETE");
                }
                catch (error)
                {
                    await this._logger.logWarning("DISPOSE ACTIONS ERROR");
                    await this._logger.logError(error as any);
                }
            }
        ]);
    }
}