import { ComponentInstaller, Registry } from "@nivinjoseph/n-ject";
import { InmemoryTodoManager } from "./services/todo-manager/inmemory-todo-manager.js";
import { DefaultConfigService } from "./services/config-service/default-config-service.js";
import { WebApp } from "../src/index.js";
import { GetTodosController } from "./controllers/api/get-todos-controller.js";
import { GetTodoController } from "./controllers/api/get-todo-controller.js";
import { CreateTodoController } from "./controllers/api/create-todo-controller.js";
import { UpdateTodoController } from "./controllers/api/update-todo-controller.js";
import { DeleteTodoController } from "./controllers/api/delete-todo-controller.js";
import { HomeController } from "./controllers/web/home/home-controller.js";
import { HomeWithLayoutController } from "./controllers/web/home-with-layout/home-with-layout-controller.js";
import { AppExceptionHandler } from "./exceptions/app-exception-handler.js";
import { ConfigurationManager } from "@nivinjoseph/n-config";
import { AppAuthenticationHandler } from "./security/app-authentication-handler.js";
import { AppAuthorizationHandler } from "./security/app-authorization-handler.js";
// import { TodoCreatedEventHandler } from "./events/todo-created-event-handler";
import { ConsoleLogger, LogDateTimeZone } from "@nivinjoseph/n-log";
import { Delay, DisposableWrapper } from "@nivinjoseph/n-util";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { SocketService } from "@nivinjoseph/n-sock/server";
import { RedisClientType, createClient } from "redis";
// import { InMemoryEventBus, InMemoryEventSubMgr } from "@nivinjoseph/n-eda";


const logger = new ConsoleLogger({ logDateTimeZone: LogDateTimeZone.est });


const redisServerClient = await createSRedisClient();
const redisServiceClient = await createSRedisClient();


class AppInstaller implements ComponentInstaller
{
    public install(registry: Registry): void
    {
        registry
            .registerSingleton("TodoManager", InmemoryTodoManager)
            .registerSingleton("ConfigService", DefaultConfigService)
            .registerInstance("Logger", logger)
            .registerInstance("SocketService", new SocketService(redisServiceClient.client));
    }
}

const controllers = [GetTodosController, GetTodoController, CreateTodoController,
    UpdateTodoController, DeleteTodoController, HomeController, HomeWithLayoutController];

// const eventHandlers = [TodoCreatedEventHandler];

const app = new WebApp(ConfigurationManager.getConfig<number>("port"), null, null, logger)
    .enableCors()
    .enableCompression()
    .useViewResolutionRoot("test-app/controllers/web")
    .useInstaller(new AppInstaller())
    .enableWebSockets("*", redisServerClient.client)
    // .useLogger(logger)
    .registerControllers(...controllers)
    // .enableEda({
    //     eventBus: InMemoryEventBus,
    //     eventSubMgr: InMemoryEventSubMgr,
    //     eventHandlerClasses: eventHandlers,
    //     iocInstaller: new AppInstaller()
    // })
    .registerAuthenticationHandler(AppAuthenticationHandler)
    .registerAuthorizationHandler(AppAuthorizationHandler)
    .registerExceptionHandler(AppExceptionHandler)
    .registerDisposeAction(() => redisServerClient.disposable.dispose())
    .registerDisposeAction(() => redisServiceClient.disposable.dispose());

app.bootstrap();


async function createSRedisClient():
    Promise<{
        client: RedisClientType<any, any, any>;
        disposable: DisposableWrapper;
    }>
{

    let client: RedisClientType<any, any, any>;
    try 
    {
        client = await createClient().connect();
        console.log(client.isReady);
    }
    catch (error: any)
    {
        await logger.logError(error);
        throw new ApplicationException("Error during socket service redis initialization", error);
    }

    const disposable = new DisposableWrapper(async () =>
    {
        await Delay.seconds(5);
        await client.quit();
    });

    return {
        client,
        disposable
    };
}