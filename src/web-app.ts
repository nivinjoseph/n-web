import * as Koa from "koa";
import * as KoaBodyParser from "koa-bodyparser";
import { Container, ComponentInstaller, Scope } from "n-ject";
import { given } from "n-defensive";
import { Router } from "./router";
import { Exception, ArgumentException, InvalidOperationException } from "n-exception";
import * as serve from "koa-static";
import * as fs from "fs";
import * as path from "path";
import "n-ext";
import * as cors from "kcors";
import { DefaultCallContext } from "./services/call-context/default-call-context";
import { AuthenticationHandler } from "./security/authentication-handler";
import { CallContext } from "./services/call-context/call-context";
import { DefaultAuthorizationHandler } from "./security/default-authorization-handler";
import { ClaimsIdentity } from "n-sec";
import { DefaultExceptionHandler } from "./exceptions/default-exception-handler";
import { HttpException } from "./exceptions/http-exception";
import { ExceptionHandler } from "./exceptions/exception-handler";
import { ConfigurationManager } from "n-config";
import * as webPackMiddleware from "koa-webpack";


// public
export class WebApp
{
    private readonly _port: number;
    private readonly _koa: Koa;
    private readonly _container: Container;
    private readonly _router: Router;
    
    private readonly _callContextKey = "CallContext";
    
    private readonly _exceptionHandlerKey = "$exceptionHandler";
    private _hasExceptionHandler = false;
    
    private readonly _authenticationHandlerKey = "$authenticationHandler";
    private _hasAuthenticationHandler = false;
    
    private readonly _authorizationHandlerKey = "$authorizationHandler";
    private _hasAuthorizationHandler = false;
    
    
    private readonly _staticFilePaths = new Array<string>();
    private _enableCors = false;
    private _viewResolutionRoot: string;
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
    
    public registerStaticFilePaths(...filePaths: string[]): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerStaticFilePaths");
        
        for (let filePath of filePaths)
        {
            filePath = filePath.trim().toLowerCase();
            if (filePath.startsWith("/"))
            {
                if (filePath.length === 1)
                {
                    throw new ArgumentException("filePath[{0}]".format(filePath), "is root");
                }    
                filePath = filePath.substr(1);
            }
            
            filePath = path.join(process.cwd(), filePath);
            
            // We skip the defensive check in dev because of webpack HMR because 
            if (ConfigurationManager.getConfig<string>("env") !== "dev")
            {
                if (!fs.existsSync(filePath))
                    throw new ArgumentException("filePath[{0}]".format(filePath), "does not exist");
            }                
            
            if (this._staticFilePaths.some(t => t === filePath))
                throw new ArgumentException("filePath[{0}]".format(filePath), "is duplicate");
            
            this._staticFilePaths.push(filePath);
        }    
        return this;
    }
    
    public registerControllers(...controllerClasses: Function[]): this
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
    
    public registerExceptionHandler(exceptionHandlerClass: Function): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerExceptionHandler");
        
        given(exceptionHandlerClass, "exceptionHandlerClass").ensureHasValue();
        this._container.registerScoped(this._exceptionHandlerKey, exceptionHandlerClass);
        this._hasExceptionHandler = true;
        return this;
    }
    
    public registerAuthenticationHandler(authenticationHandler: Function): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("registerAuthenticationHandler");
        
        given(authenticationHandler, "authenticationHandler").ensureHasValue();
        this._container.registerScoped(this._authenticationHandlerKey, authenticationHandler);
        this._hasAuthenticationHandler = true;
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
    
    public enableWebPackDevMiddleware(makeItHot: boolean = false, publicPath: string = "/"): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("enableWebPackDevMiddleware");
        
        if (ConfigurationManager.getConfig<string>("env") === "dev")
            this._koa.use(webPackMiddleware(
                {
                    dev: { publicPath },
                    hot: <any>{ reload: true, hot: makeItHot }
                }
            ));
        
        return this;
    }
    
    public bootstrap(): void
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("bootstrap");
        
        this.configureCors();
        this.configureContainer();
        this.configureScoping();
        this.configureCallContext();
        this.configureExceptionHandling();
        this.configureErrorTrapping();
        this.configureAuthentication();
        this.configureStaticFileServing();
        this.configureBodyParser();
        this.configureRouting(); // must be last
        
        this._koa.listen(this._port);
        this._isBootstrapped = true;
    }
    
    
    private configureCors(): void
    {
        if (this._enableCors)
            this._koa.use(cors());    
    }
    
    private configureContainer(): void
    { 
        this._container.registerScoped(this._callContextKey, DefaultCallContext);
        
        if (!this._hasAuthorizationHandler)
            this._container.registerScoped(this._authorizationHandlerKey, DefaultAuthorizationHandler);
        
        if (!this._hasExceptionHandler)
            this._container.registerInstance(this._exceptionHandlerKey, new DefaultExceptionHandler(null, true));    
        
        this._container.bootstrap();
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
            defaultCallContext.configure(ctx);
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
                        let logMessage = "";
                        if (exp instanceof Exception)
                            logMessage = exp.toString();
                        else if (exp instanceof Error)
                            logMessage = exp.stack;
                        else
                            logMessage = exp.toString();

                        console.log(Date.now(), logMessage);
                        
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
        for (let path of this._staticFilePaths)
            this._koa.use(serve(path));
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
}