import { ComponentInstaller } from "n-ject";
export declare class WebApp {
    private readonly _port;
    private readonly _koa;
    private readonly _container;
    private readonly _router;
    constructor(port: number);
    registerControllers(...controllers: Function[]): this;
    registerInstaller(installer: ComponentInstaller): this;
    bootstrap(): void;
    private configureContainer();
    private configureScoping();
    private configureBodyParser();
    private configureRouting();
}
