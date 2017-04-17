import { ComponentInstaller } from "n-ject";
import "n-ext";
export declare class WebApp {
    private readonly _port;
    private readonly _koa;
    private readonly _container;
    private readonly _router;
    private readonly _exceptionHandlerKey;
    private _hasExceptionHandler;
    private readonly _staticFilePaths;
    private _enableCors;
    constructor(port: number);
    enableCors(): this;
    registerStaticFilePaths(...filePaths: string[]): this;
    registerControllers(...controllerClasses: Function[]): this;
    registerInstaller(installer: ComponentInstaller): this;
    registerExceptionHandler(exceptionHandlerClass: Function): this;
    bootstrap(): void;
    private configureCors();
    private configureContainer();
    private configureScoping();
    private configureHttpExceptionHandling();
    private configureExceptionHandling();
    private configureErrorTrapping();
    private configureStaticFileServing();
    private configureBodyParser();
    private configureRouting();
}
