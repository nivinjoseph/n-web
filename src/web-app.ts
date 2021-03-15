import * as Koa from "koa";
import * as KoaBodyParser from "koa-bodyparser";
import { Container, ComponentInstaller, Scope, Registry } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
import { Router } from "./router";
import { Exception, ArgumentException, InvalidOperationException } from "@nivinjoseph/n-exception";
import * as serve from "koa-static";
import * as fs from "fs";
import * as path from "path";
import "@nivinjoseph/n-ext";
import * as cors from "kcors";
import { DefaultCallContext } from "./services/call-context/default-call-context";
import { AuthenticationHandler } from "./security/authentication-handler";
import { CallContext } from "./services/call-context/call-context";
import { DefaultAuthorizationHandler } from "./security/default-authorization-handler";
import { ClaimsIdentity } from "@nivinjoseph/n-sec";
import { DefaultExceptionHandler } from "./exceptions/default-exception-handler";
import { HttpException } from "./exceptions/http-exception";
import { ExceptionHandler } from "./exceptions/exception-handler";
import { ConfigurationManager } from "@nivinjoseph/n-config";
// const koaWebpack = require("@nivinjoseph/koa-webpack");
import { ConsoleLogger, Logger } from "@nivinjoseph/n-log";
import { ClassHierarchy, Delay } from "@nivinjoseph/n-util";
import * as Http from "http";
import { ApplicationScript } from "./application-script";
import { SocketServer } from "@nivinjoseph/n-sock/dist/backend";
import * as Compress from "koa-compress";
import { HmrHelper } from "./hmr-helper";
import { Controller } from "./controller";
import { AuthorizationHandler } from "./security/authorization-handler";
import * as Redis from "redis";
// import Compress = require("kompression");
// const Compress = require("@nivinjoseph/kompression");


// public
export class WebApp
{
    private readonly _port: number;
    private readonly _host: string | null;
    private readonly _koa: Koa;
    private readonly _container: Container;
    private readonly _router: Router;
    
    private readonly _callContextKey = "CallContext";

    // private _edaConfig: EdaConfig;
    // private _edaManager: EdaManager;
        
    // private _backgroundProcessor: BackgroundProcessor;

    // private readonly _jobRegistrations = new Array<Function>();
    // private readonly _jobInstances = new Array<Job>();
    
    private readonly _exceptionHandlerKey = "$exceptionHandler";
    private _hasExceptionHandler = false;
    
    private readonly _authenticationHandlerKey = "$authenticationHandler";
    private _hasAuthenticationHandler = false;
    private _authHeaders = ["authorization"];
    
    private readonly _authorizationHandlerKey = "$authorizationHandler";
    private _hasAuthorizationHandler = false;
    
    private _logger: Logger;
    
    private readonly _startupScriptKey = "$startupScript";
    private _hasStartupScript = false;
    
    private readonly _shutdownScriptKey = "$shutdownScript";
    private _hasShutdownScript = false;
    
    
    private readonly _staticFilePaths = new Array<{ path: string; cache: boolean }>();
    private _enableCors = false;
    private _enableCompression = false;
    private _viewResolutionRoot: string;
    private _webPackDevMiddlewarePublicPath: string | null = null;
    // // @ts-ignore
    // private _webPackDevMiddlewareClientHost: string | null = null;
    // // @ts-ignore
    // private _webPackDevMiddlewareServerHost: string | null = null;    
    
    private _enableWebSockets = false;
    private _corsOrigin: string | null = null;
    private _socketServerRedisClient: Redis.RedisClient | null = null;
    private _socketServer: SocketServer | null = null;
    
    private _disposeActions = new Array<() => Promise<void>>();
    private _server: Http.Server;
    private _isBootstrapped: boolean = false;
    
    private _isShutDown = false;
    
    
    public get containerRegistry(): Registry { return this._container; }
    
    
    public constructor(port: number, host: string | null, container?: Container)
    {
        given(port, "port").ensureHasValue().ensureIsNumber();
        this._port = port;
        
        given(host, "host").ensureIsString();
        this._host = host ? host.trim() : null;
        
        given(container as Container, "container").ensureIsObject().ensureIsType(Container);
        
        this._koa = new Koa();
        this._container = container ?? new Container();
        this._router = new Router(this._koa, this._container, this._authorizationHandlerKey, this._callContextKey);
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
    
    // public enableEda(config: EdaConfig): this
    // {
    //     if (this._isBootstrapped)
    //         throw new InvalidOperationException("enableEda"); 
        
    //     given(config, "config").ensureHasValue().ensureIsObject();
    //     this._edaConfig = config;
    //     return this;
    // }
    
    public registerStaticFilePath(filePath: string, cache = false): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerStaticFilePaths");
        
        given(filePath, "filePath").ensureHasValue().ensureIsString();
        given(cache, "cache").ensureHasValue().ensureIsBoolean();
        
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

        this._staticFilePaths.push({path: filePath, cache: cache});
        
        return this;
    }
    
    public registerControllers(...controllerClasses: ReadonlyArray<ClassHierarchy<Controller>>): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerControllers");
        
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
    
    public useLogger(logger: Logger): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("useLogger");

        given(logger, "logger").ensureHasValue().ensureIsObject();
        
        this._logger = logger;
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
        this._container.registerScoped(this._exceptionHandlerKey, exceptionHandlerClass);
        this._hasExceptionHandler = true;
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
        this._container.registerScoped(this._authorizationHandlerKey, authorizationHandler);
        this._hasAuthorizationHandler = true;
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
    
    public enableWebSockets(corsOrigin: string, socketServerRedisClient: Redis.RedisClient): this
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
    
    public enableWebPackDevMiddleware(publicPath: string = "/"): this
    {
        given(publicPath, "publicPath").ensureHasValue().ensureIsString();
        // given(clientHost, "clientHost").ensureIsString();
        // given(serverHost, "serverHost").ensureIsString();
        
        if (this._isBootstrapped)
            throw new InvalidOperationException("enableWebPackDevMiddleware");
        
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
                            console.error(e);
                            resolve();
                            // // tslint:disable-next-line
                            // this._logger.logError(e).then(() => resolve());
                        });
                }
                catch (error)
                {
                    console.error(error);
                    resolve();
                    // // tslint:disable-next-line
                    // this._logger.logError(error).then(() => resolve());
                }
            });
        });
        return this;
    }
    
    public bootstrap(): void
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("bootstrap");
        
        if (!this._logger)
            this._logger = new ConsoleLogger();
        
        // this._backgroundProcessor = new BackgroundProcessor((e) => this._logger.logError(e as any));
        // this.registerDisposeAction(() => this._backgroundProcessor.dispose());
        
        this.configureCors();
        // this.configureEda();
        this.configureContainer();
        // this.initializeJobs();
        this.configureStartup()
            .then(() =>
            {
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
            .then(() =>
            {
                this.configureBodyParser();
                this.configureRouting(); // must be last
                // this is the request response pipeline END

                const appEnv = ConfigurationManager.getConfig<string>("env");
                const appName = ConfigurationManager.getConfig<string>("package.name");
                const appVersion = ConfigurationManager.getConfig<string>("package.version");
                const appDescription = ConfigurationManager.getConfig<string>("package.description");

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
            .catch(e =>
            {
                console.error("STARTUP FAILED!!!");
                console.error(e);
                throw e;
            });
    }
    
    
    private configureCors(): void
    {
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
    
    private configureContainer(): void
    { 
        this._container.registerScoped(this._callContextKey, DefaultCallContext);

        // this._jobRegistrations.forEach(jobClass => this._container.registerSingleton((<Object>jobClass).getTypeName(), jobClass));
        
        if (!this._hasAuthorizationHandler)
            this._container.registerScoped(this._authorizationHandlerKey, DefaultAuthorizationHandler);
        
        if (!this._hasExceptionHandler)
            this._container.registerInstance(this._exceptionHandlerKey, new DefaultExceptionHandler(this._logger));    
        
        this._container.bootstrap();
        
        this.registerDisposeAction(() => this._container.dispose());
    }
    
    private configureStartup(): Promise<void>
    {
        console.log("SERVER STARTING.");
        
        if (!this._hasStartupScript)
            return Promise.resolve();
        
        return this._container.resolve<ApplicationScript>(this._startupScriptKey).run();
    }
    
    // private initializeJobs(): void
    // {
    //     this._jobRegistrations.forEach(jobClass =>
    //         this._jobInstances.push(this._container.resolve((<Object>jobClass).getTypeName())));
    // }
    
    // this is the first
    private configureScoping(): void
    {
        this._koa.use(async (ctx, next) =>
        {
            if (this._isShutDown)
            {    
                ctx.response.status = 503;
                ctx.response.body = "Server shutdown.";
                return;
            }
            
            ctx.state.scope = this._container.createScope();
            try 
            {
                await next();    
            }
            catch (error)
            {
                throw error;
            }
            finally
            {
                await (<Scope>ctx.state.scope).dispose();
            }
        });
    }
    
    private configureCallContext(): void
    {
        this._koa.use(async (ctx, next) =>
        {
            let scope: Scope = ctx.state.scope;
            let defaultCallContext = scope.resolve<DefaultCallContext>(this._callContextKey);
            defaultCallContext.configure(ctx as any, this._authHeaders);
            await next();
        });
    }
    
    private configureCompression(): void
    {
        if (this._enableCompression)
            this._koa.use(Compress());
    }
    
    private configureExceptionHandling(): void
    {
        this._koa.use(async (ctx, next) =>
        {
            try 
            {
                await next();
            }
            catch (error)
            {   
                if (error instanceof HttpException)
                {  
                    ctx.status = error.statusCode;
                    if (error.body !== undefined && error.body !== null)
                        ctx.body = error.body;
                    
                    return;
                }
                    
                let scope = ctx.state.scope as Scope;
                let exceptionHandler = scope.resolve<ExceptionHandler>(this._exceptionHandlerKey);
                
                try 
                {
                    const result = await exceptionHandler.handle(error);
                    ctx.body = result;
                }
                catch (exp)
                {
                    if (exp instanceof HttpException)
                    {
                        const httpExp: HttpException = exp as HttpException;
                        ctx.status = httpExp.statusCode;
                        if (httpExp.body !== undefined && httpExp.body !== null)
                            ctx.body = httpExp.body;
                    }   
                    else
                    {
                        // let logMessage = "";
                        // if (exp instanceof Exception)
                        //     logMessage = exp.toString();
                        // else if (exp instanceof Error)
                        //     logMessage = exp.stack;
                        // else
                        //     logMessage = exp.toString();

                        // console.log(Date.now(), logMessage);
                        
                        await this._logger.logError(exp);
                        
                        ctx.status = 500;
                        ctx.body = "There was an error processing your request.";
                    }    
                }
            }
        });
    }
    
    private configureErrorTrapping(): void
    {
        // @ts-ignore
        this._koa.use(async (ctx, next) =>
        {
            try 
            {
                await next();
            }
            catch (error)
            {
                if (error instanceof Error)
                    throw error;    
                
                let message = error.toString() as string;
                if (message === "[object Object]")
                {
                    console.error(error);
                    message = JSON.stringify(error);
                }
                
                throw new Exception("TRAPPED ERROR | " + message);
            }
        });
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
    
    private configureAuthentication(): void
    {
        if (!this._hasAuthenticationHandler)
            return;
        
        this._koa.use(async (ctx, next) =>
        {
            let scope = ctx.state.scope as Scope;
            let callContext = scope.resolve<CallContext>(this._callContextKey);
            if (callContext.hasAuth)
            {
                let authenticationHandler = scope.resolve<AuthenticationHandler>(this._authenticationHandlerKey);
                let identity = await authenticationHandler.authenticate(callContext.authScheme, callContext.authToken);
                if (identity && identity instanceof ClaimsIdentity)
                    ctx.state.identity = identity;  
            }    
            
            await next();
        });
    }
    
    private configureStaticFileServing(): void
    {
        for (let item of this._staticFilePaths)
            this._koa.use(serve(item.path, item.cache ? {maxage: 1000 * 60 * 60 * 24 * 365} : null));
    }
    
    private configureBodyParser(): void
    {
        this._koa.use(KoaBodyParser({
            strict: true,
            jsonLimit: "250mb"
        }));
    }
    
    // this is the last
    private configureRouting(): void
    {
        this._router.configureRouting(this._viewResolutionRoot);
    }
    
    private configureWebSockets(): void
    {
        if (!this._enableWebSockets)
            return;
        
        this._socketServer = new SocketServer(this._server, this._corsOrigin, this._socketServerRedisClient);
        this.registerDisposeAction(() => this._socketServer.dispose());
    }
    
    private configureWebPackDevMiddleware(): Promise<void>
    {
        if (ConfigurationManager.getConfig<string>("env") === "dev" && this._webPackDevMiddlewarePublicPath != null)
        {
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
            }).then((middleware: any) =>
            {
                this._koa.use(middleware);
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
    
    private configureShutDown(): void
    {
        // if (ConfigurationManager.getConfig<string>("env") === "dev")
        //     return;
        
        this.registerDisposeAction(() =>
        {
            console.log("CLEANING UP. PLEASE WAIT...");
            return Delay.seconds(ConfigurationManager.getConfig<string>("env") === "dev" ? 2 : 20);
        });
        
        const shutDown = (signal: string) =>
        {
            if (this._isShutDown)
                return;
            
            this._isShutDown = true;
                       
            this._server.close(async () =>
            {
                console.warn(`SERVER STOPPING (${signal}).`);
                
                if (this._hasShutdownScript)
                {
                    console.log("Shutdown script executing.");
                    try 
                    {
                        await this._container.resolve<ApplicationScript>(this._shutdownScriptKey).run();    
                        console.log("Shutdown script complete.");
                    }
                    catch (error)
                    {
                        console.warn("Shutdown script error.");
                        console.error(error);
                    }
                }
                
                console.log("Dispose actions executing.");
                try
                {
                    await Promise.all(this._disposeActions.map(t => t()));
                    console.log("Dispose actions complete.");
                }
                catch (error)
                {
                    console.warn("Dispose actions error.");
                    console.error(error);
                }
                
                console.warn(`SERVER STOPPED (${signal}).`);
                process.exit(0);
            });
        };
        
        process.on("SIGTERM", () => shutDown("SIGTERM"));
        process.on("SIGINT", () => shutDown("SIGINT"));
    }
}