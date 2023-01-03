import { ComponentInstaller, Registry } from "@nivinjoseph/n-ject";
import { InmemoryTodoManager } from "./services/todo-manager/inmemory-todo-manager";
import { DefaultConfigService } from "./services/config-service/default-config-service";
import { WebApp } from "../src/index";
import { GetTodosController } from "./controllers/api/get-todos-controller";
import { GetTodoController } from "./controllers/api/get-todo-controller";
import { CreateTodoController } from "./controllers/api/create-todo-controller";
import { UpdateTodoController } from "./controllers/api/update-todo-controller";
import { DeleteTodoController } from "./controllers/api/delete-todo-controller";
import { HomeController } from "./controllers/web/home/home-controller";
import { HomeWithLayoutController } from "./controllers/web/home-with-layout/home-with-layout-controller"; 
import { AppExceptionHandler } from "./exceptions/app-exception-handler";
import { ConfigurationManager } from "@nivinjoseph/n-config";
import { AppAuthenticationHandler } from "./security/app-authentication-handler";
import { AppAuthorizationHandler } from "./security/app-authorization-handler";
// import { TodoCreatedEventHandler } from "./events/todo-created-event-handler";
import { ConsoleLogger, LogDateTimeZone } from "@nivinjoseph/n-log";
// import { InMemoryEventBus, InMemoryEventSubMgr } from "@nivinjoseph/n-eda";


const logger = new ConsoleLogger({logDateTimeZone: LogDateTimeZone.est});

class AppInstaller implements ComponentInstaller
{
    public install(registry: Registry): void
    {
        registry
            .registerSingleton("TodoManager", InmemoryTodoManager)
            .registerSingleton("ConfigService", DefaultConfigService)
            .registerInstance("Logger", logger);
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
    .registerExceptionHandler(AppExceptionHandler);

app.bootstrap();

