import * as Koa from "koa";
import * as KoaBodyParser from "koa-bodyparser";
import { Container, ComponentInstaller, Scope } from "n-ject";
import { given } from "n-defensive";
import { Router } from "./router";
import { Exception, ArgumentException, InvalidOperationException } from "n-exception";
import { ExceptionHandler } from "./exception-handler";
import { HttpException } from "./http-exception";
import * as serve from "koa-static";
import * as fs from "fs";
import * as path from "path";
import "n-ext";
import * as cors from "kcors";


// public
export class WebApp
{
    private readonly _port: number;
    private readonly _koa: Koa;
    private readonly _container: Container;
    private readonly _router: Router;
    private readonly _exceptionHandlerKey = "$exceptionHandler";
    private _hasExceptionHandler = false;
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
        this._router = new Router(this._koa, this._container);
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
                    throw new ArgumentException("filePath[{0}]".format(filePath), "is root");    
                filePath = filePath.substr(1);
            }
            
            filePath = path.join(process.cwd(), filePath);
            if (!fs.existsSync(filePath))
                throw new ArgumentException("filePath[{0}]".format(filePath), "does not exist");    
            
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
    
    public registerInstaller(installer: ComponentInstaller): this
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
    
    public useViewResolutionRoot(path: string): this
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("useViewResolutionRoot");
        
        given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._viewResolutionRoot = path.trim();
        return this;
    }
    
    public bootstrap(): void
    {
        if (this._isBootstrapped)
            throw new InvalidOperationException("bootstrap");
        
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
        this._isBootstrapped = true;
    }
    
    
    private configureCors(): void
    {
        if (this._enableCors)
            this._koa.use(cors());    
    }
    
    private configureContainer(): void
    { 
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
    
    private configureHttpExceptionHandling(): void
    {
        this._koa.use(async (ctx, next) => 
        {
            try 
            {
                await next();
            } 
            catch (error) 
            {
                if (!(error instanceof HttpException))
                    throw error;   
                
                let exp = error as HttpException;
                ctx.status = exp.statusCode;
                if (exp.body !== undefined && exp.body !== null)
                    ctx.body = exp.body;
            }
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
                if (!this._hasExceptionHandler)
                    throw error;
                
                if (error instanceof HttpException)
                    throw error;   
                    
                let scope = ctx.state.scope as Scope;
                let exceptionHandler = scope.resolve<ExceptionHandler>(this._exceptionHandlerKey);
                ctx.body = await exceptionHandler.handle(error);
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
                
                throw new Exception(error.toString());
            }
        });
    }
    
    private configureStaticFileServing(): void
    {
        for (let path of this._staticFilePaths)
            this._koa.use(serve(path));
    }
    
    private configureBodyParser(): void
    {
        this._koa.use(KoaBodyParser({strict: true}));
    }
    
    private configureRouting(): void
    {
        this._router.configureRouting(this._viewResolutionRoot);
    }
}