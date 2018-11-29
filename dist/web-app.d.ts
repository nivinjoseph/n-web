import { ComponentInstaller } from "@nivinjoseph/n-ject";
import "@nivinjoseph/n-ext";
import { Logger } from "@nivinjoseph/n-log";
export declare class WebApp {
    private readonly _port;
    private readonly _koa;
    private readonly _container;
    private readonly _router;
    private readonly _callContextKey;
    private readonly _eventBusKey;
    private readonly _eventRegistrations;
    private _backgroundProcessor;
    private readonly _jobRegistrations;
    private readonly _jobInstances;
    private readonly _exceptionHandlerKey;
    private _hasExceptionHandler;
    private readonly _authenticationHandlerKey;
    private _hasAuthenticationHandler;
    private _authHeader;
    private readonly _authorizationHandlerKey;
    private _hasAuthorizationHandler;
    private _logger;
    private readonly _staticFilePaths;
    private _enableCors;
    private _viewResolutionRoot;
    private _webPackDevMiddlewarePublicPath;
    private _disposeActions;
    private _server;
    private _isBootstrapped;
    constructor(port: number);
    enableCors(): this;
    registerStaticFilePath(filePath: string, cache?: boolean): this;
    registerControllers(...controllerClasses: Function[]): this;
    registerEventHandlers(...eventHandlerClasses: Function[]): this;
    registerJobs(...jobClasses: Function[]): this;
    useLogger(logger: Logger): this;
    useInstaller(installer: ComponentInstaller): this;
    registerExceptionHandler(exceptionHandlerClass: Function): this;
    registerAuthenticationHandler(authenticationHandler: Function, authHeader?: string): this;
    registerAuthorizationHandler(authorizationHandler: Function): this;
    useViewResolutionRoot(path: string): this;
    enableWebPackDevMiddleware(publicPath?: string): this;
    registerDisposeAction(disposeAction: () => Promise<void>): this;
    bootstrap(): void;
    private configureCors;
    private configureContainer;
    private configureScoping;
    private configureCallContext;
    private configureExceptionHandling;
    private configureErrorTrapping;
    private configureAuthentication;
    private configureStaticFileServing;
    private configureBodyParser;
    private configureRouting;
    private configureWebPackDevMiddleware;
    private configureShutDown;
}
