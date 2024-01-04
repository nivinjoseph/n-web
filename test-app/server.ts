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

