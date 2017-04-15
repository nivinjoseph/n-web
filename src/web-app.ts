import * as Koa from "koa";
import * as KoaBodyParser from "koa-bodyparser";
import { Container, ComponentInstaller, Scope } from "n-ject";
import { given } from "n-defensive";
import { Router } from "./router";
import { Exception } from "n-exception";
import { ExceptionLogger } from "./exception-logger";
import { ExceptionHandler } from "./exception-handler";
import { HttpException } from "./http-exception";

// public
export class WebApp
{
    private readonly _port: number;
    private readonly _koa: Koa;
    private readonly _container: Container;
    private readonly _router: Router;
    private readonly _exceptionLoggerKey = "$exceptionLogger";
    private _hasExceptionLogger = false;
    private readonly _exceptionHandlerKey = "$exceptionHandler";
    private _hasExceptionHandler = false;
    
    
    public constructor(port: number)
    {
        given(port, "port").ensureHasValue();
        this._port = port;
        this._koa = new Koa();
        this._container = new Container();
        this._router = new Router(this._koa, this._container);
    }
    
    public registerControllers(...controllerClasses: Function[]): this
    {
        this._router.registerControllers(...controllerClasses);
        return this;
    }
    
    public registerInstaller(installer: ComponentInstaller): this
    {
        given(installer, "installer").ensureHasValue();
        this._container.install(installer);
        return this;
    }
    
    public registerExceptionLogger(exceptionLoggerClass: Function): this
    {
        given(exceptionLoggerClass, "exceptionLoggerClass").ensureHasValue();
        this._container.registerScoped(this._exceptionLoggerKey, exceptionLoggerClass);
        this._hasExceptionLogger = true;
        return this;
    }
    
    public registerExceptionHandler(exceptionHandlerClass: Function): this
    {
        given(exceptionHandlerClass, "exceptionHandlerClass").ensureHasValue();
        this._container.registerScoped(this._exceptionHandlerKey, exceptionHandlerClass);
        this._hasExceptionHandler = true;
        return this;
    }
    
    public bootstrap(): void
    {
        this.configureContainer();
        this.configureScoping();
        this.configureHttpExceptionHandling();
        this.configureExceptionHandling();
        this.configureExceptionLogging();
        this.configureErrorTrapping();
        // this.configureAuthentication();
        // this.configureAuthorization();
        this.configureBodyParser();
        this.configureRouting(); // must be last
        this._koa.listen(this._port);
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
                let exp = error as HttpException;
                if (exp.name !== "HttpException")
                    throw error;
                    
                ctx.status = exp.statusCode;
                if (exp.body !== null)
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
                
                let exp = error as Exception;
                if (exp.name === "HttpException")
                    throw error;
                    
                let scope = ctx.state.scope as Scope;
                let exceptionHandler = scope.resolve<ExceptionHandler>(this._exceptionHandlerKey);
                ctx.body = await exceptionHandler.handle(exp);
            }
        });
    }
    
    private configureExceptionLogging(): void
    {
        this._koa.use(async (ctx, next) =>
        {
            try 
            {
                await next();
            }
            catch (error)
            {
                if (!this._hasExceptionLogger)
                    throw error;    
                
                let exp = error as Exception;
                if (exp.name === "HttpException")
                    throw error;
                
                let scope = ctx.state.scope as Scope;
                let exceptionLogger = scope.resolve<ExceptionLogger>(this._exceptionLoggerKey);
                await exceptionLogger.log(exp);
            }
        });
    }
    
    // private configureAuthentication(): void
    // {
    //     this._koa.use(async (ctx, next) => 
    //     {
    //         ctx.he
    //     });
    // }
    
    // private configureAuthorization(): void
    // {
        
    // }
    
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
                    throw new Exception("Caught Error.", error);
                
                if (error instanceof Exception)
                    throw error;
                
                throw new Exception(error.toString());
            }
        });
    }
    
    private configureBodyParser(): void
    {
        this._koa.use(KoaBodyParser({strict: true}));
    }
    
    private configureRouting(): void
    {
        this._router.configureRouting();
    }
}