import * as Koa from "koa";
import * as KoaBodyParser from "koa-bodyparser";
import { Container, ComponentInstaller, Scope } from "@nivinjoseph/n-ject";
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
import * as webPackMiddleware from "koa-webpack";
import { ConsoleLogger, Logger } from "@nivinjoseph/n-log";
import { DefaultEventAggregator } from "./services/event-aggregator/default-event-aggregator";
import { EventHandlerRegistration } from "./services/event-aggregator/event-handler-registration";
import { BackgroundProcessor, Delay } from "@nivinjoseph/n-util";
import * as Http from "http";


// public
export class WebApp
{
    private readonly _port: number;
    private readonly _koa: Koa;
    private readonly _container: Container;
    private readonly _router: Router;
    
    private readonly _callContextKey = "CallContext";
    private readonly _eventAggregatorKey = "EventAggregator";
    private readonly _eventRegistrations = new Array<EventHandlerRegistration>();
    private _backgroundProcessor: BackgroundProcessor;
    
    private readonly _exceptionHandlerKey = "$exceptionHandler";
    private _hasExceptionHandler = false;
    
    private readonly _authenticationHandlerKey = "$authenticationHandler";
    private _hasAuthenticationHandler = false;
    private _authHeader = "authorization";
    
    private readonly _authorizationHandlerKey = "$authorizationHandler";
    private _hasAuthorizationHandler = false;
    
    private _logger: Logger;
    
    
    private readonly _staticFilePaths = new Array<{ path: string; cache: boolean }>();
    private _enableCors = false;
    private _viewResolutionRoot: string;
    private _disposeActions = new Array<() => Promise<void>>();
    private _server: Http.Server;
    private _isBootstrapped: boolean = false;
    
    
    public constructor(port: number)
    {
        given(port, "port").ensureHasValue();
        this._port = port;
        this._koa = new Koa();
        this._container = new Container();
        this._router = new Router(this._koa, this._container, this._authorizationHandlerKey, this._callContextKey);
    }
    
    
    public enableCors(): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("enableCors");
        
        this._enableCors = true;
        return this;
    }
    
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
    
    public registerControllers(...controllerClasses: Function[]): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerControllers");
        
        this._router.registerControllers(...controllerClasses);
        return this;
    }
    
    public registerEventHandlers(...eventHandlerClasses: Function[]): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerEventHandlers");
        
        this._eventRegistrations.push(...eventHandlerClasses.map(t => new EventHandlerRegistration(t)));
        return this;
    }
    
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
    
    public registerExceptionHandler(exceptionHandlerClass: Function): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerExceptionHandler");
        
        given(exceptionHandlerClass, "exceptionHandlerClass").ensureHasValue();
        this._container.registerScoped(this._exceptionHandlerKey, exceptionHandlerClass);
        this._hasExceptionHandler = true;
        return this;
    }
    
    public registerAuthenticationHandler(authenticationHandler: Function, authHeader?: string): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerAuthenticationHandler");
        
        given(authenticationHandler, "authenticationHandler").ensureHasValue();
        given(authHeader, "authHeader").ensureIsString().ensure(t => !t.isEmptyOrWhiteSpace());
        this._container.registerScoped(this._authenticationHandlerKey, authenticationHandler);
        this._hasAuthenticationHandler = true;
        if (authHeader)
            this._authHeader = authHeader.trim();    
        return this;
    }
    
    public registerAuthorizationHandler(authorizationHandler: Function): this
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
    
    public enableWebPackDevMiddleware(publicPath: string = "/"): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("enableWebPackDevMiddleware");
        
        if (ConfigurationManager.getConfig<string>("env") === "dev")
            this._koa.use(webPackMiddleware(
                {
                    dev: { publicPath, writeToDisk: true },
                    hot: <any>{ reload: true, hot: true }
                } as any
            ));
        
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
                            this._logger.logError(e).then(() => resolve());
                        });
                }
                catch (error)
                {
                    this._logger.logError(error).then(() => resolve());
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
        
        this._backgroundProcessor = new BackgroundProcessor((e) => this._logger.logError(e as any));
        this.registerDisposeAction(() => this._backgroundProcessor.dispose());
        
        this.configureCors();
        this.configureContainer();
        this.configureScoping();
        this.configureCallContext();
        this.configureExceptionHandling();
        this.configureErrorTrapping();
        // this.configureEventHandling();
        this.configureAuthentication();
        this.configureStaticFileServing();
        this.configureBodyParser();
        this.configureRouting(); // must be last
        
        const appEnv = ConfigurationManager.getConfig<string>("env");
        const appName = ConfigurationManager.getConfig<string>("appInfo.name");
        const appVersion = ConfigurationManager.getConfig<string>("appInfo.version");
        const appDescription = ConfigurationManager.getConfig<string>("appInfo.description");
        
        console.log("SERVER STARTING.");
        console.log(`ENV: ${appEnv}; NAME: ${appName}; VERSION: ${appVersion}; DESCRIPTION: ${appDescription}.`);
        this._server = Http.createServer(this._koa.callback());
        this._server.listen(this._port);
        this.configureShutDown();
        
        this._isBootstrapped = true;
        console.log("SERVER STARTED.");
    }
    
    
    private configureCors(): void
    {
        if (this._enableCors)
            this._koa.use(cors());    
    }
    
    private configureContainer(): void
    { 
        this._container.registerScoped(this._callContextKey, DefaultCallContext);
        
        this._container.registerSingleton(this._eventAggregatorKey, DefaultEventAggregator);
        this._eventRegistrations.forEach(t => this._container.registerSingleton(t.eventHandlerName, t.eventHandler));
        
        if (!this._hasAuthorizationHandler)
            this._container.registerScoped(this._authorizationHandlerKey, DefaultAuthorizationHandler);
        
        if (!this._hasExceptionHandler)
            this._container.registerInstance(this._exceptionHandlerKey, new DefaultExceptionHandler(this._logger));    
        
        this._container.bootstrap();
        
        const eventAggregatorInstance = this._container.resolve<DefaultEventAggregator>(this._eventAggregatorKey);
        eventAggregatorInstance.useProcessor(this._backgroundProcessor);
        this._eventRegistrations.forEach(t => eventAggregatorInstance.subscribe(t.eventName, this._container.resolve(t.eventHandlerName)));
    }
    
    private configureScoping(): void
    {
        this._koa.use(async (ctx, next) =>
        {
            ctx.state.scope = this._container.createScope();
            await next();
        });
    }
    
    private configureCallContext(): void
    {
        this._koa.use(async (ctx, next) =>
        {
            let scope: Scope = ctx.state.scope;
            let defaultCallContext = scope.resolve<DefaultCallContext>(this._callContextKey);
            defaultCallContext.configure(ctx, this._authHeader);
            await next();
        });
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
                
                throw new Exception("TRAPPED ERROR | " + error.toString());
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
    
    private configureRouting(): void
    {
        this._router.configureRouting(this._viewResolutionRoot);
    }
    
    private configureShutDown(): void
    {
        if (ConfigurationManager.getConfig<string>("env") === "dev")
            return;
        
        this.registerDisposeAction(() =>
        {
            console.log("CLEANING UP. PLEASE WAIT...");
            return Delay.seconds(10);
        });
        
        const shutDown = (signal: string) =>
        {
            this._server.close(() =>
            {
                console.log(`SERVER STOPPING (${signal}).`);
                
                Promise.all(this._disposeActions.map(t => t()))
                    .then(() =>
                    {
                        console.log(`SERVER STOPPED (${signal}).`);
                        process.exit(0);
                    })
                    .catch((e) =>
                    {
                        // this will never happen because of how disposeActions work
                        console.error(e);
                        process.exit(1);
                    });
            });
        };
        
        process.on("SIGTERM", () => shutDown("SIGTERM"));
        process.on("SIGINT", () => shutDown("SIGINT"));
    }
}