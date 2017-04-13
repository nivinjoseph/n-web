import { ComponentInstaller } from "n-ject";
export declare class WebApp {
    private readonly _port;
    private readonly _koa;
    private readonly _container;
    private readonly _router;
    private readonly _exceptionLoggerKey;
    private _hasExceptionLogger;
    private readonly _exceptionHandlerKey;
    private _hasExceptionHandler;
    constructor(port: number);
    registerControllers(...controllerClasses: Function[]): this;
    registerInstaller(installer: ComponentInstaller): this;
    registerExceptionLogger(exceptionLoggerClass: Function): this;
    registerExceptionHandler(exceptionHandlerClass: Function): this;
    bootstrap(): void;
    private configureContainer();
    private configureScoping();
    private configureHttpExceptionHandling();
    private configureExceptionHandling();
    private configureExceptionLogging();
    private configureErrorTrapping();
    private configureBodyParser();
    private configureRouting();
}
