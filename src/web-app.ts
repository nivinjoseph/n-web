import * as Koa from "koa";
import * as KoaBodyParser from "koa-bodyparser";
import { Container, ComponentInstaller } from "n-ject";
import { given } from "n-defensive";
import { Router } from "./router";

// public
export class WebApp
{
    private readonly _port: number;
    private readonly _koa: Koa;
    private readonly _container: Container;
    private readonly _router: Router;
    
    
    public constructor(port: number)
    {
        given(port, "port").ensureHasValue();
        this._port = port;
        this._koa = new Koa();
        this._container = new Container();
        this._router = new Router(this._koa, this._container);
    }
    
    public registerControllers(...controllers: Function[]): this
    {
        this._router.registerControllers(...controllers);
        return this;
    }
    
    public registerInstaller(installer: ComponentInstaller): this
    {
        given(installer, "installer").ensureHasValue();
        this._container.install(installer);
        return this;
    }
    
    public bootstrap(): void
    {
        this.configureContainer();
        this.configureScoping();
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
    
    private configureBodyParser()
    {
        this._koa.use(KoaBodyParser({strict: true}));
    }
    
    private configureRouting(): void
    {
        this._router.configureRouting();
    }
}