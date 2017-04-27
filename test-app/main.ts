import { ComponentInstaller, Registry } from "n-ject";
import { InmemoryTodoManager } from "./services/todo-manager/inmemory-todo-manager";
import { DefaultConfigService } from "./services/config-service/default-config-service";
import { ConsoleLogger } from "./services/logger/consoleLogger";
import { WebApp } from "./../src/index";
import { GetTodosController } from "./controllers/api/get-todos-controller";
import { GetTodoController } from "./controllers/api/get-todo-controller";
import { CreateTodoController } from "./controllers/api/create-todo-controller";
import { UpdateTodoController } from "./controllers/api/update-todo-controller";
import { DeleteTodoController } from "./controllers/api/delete-todo-controller";
import { HomeController } from "./controllers/web/home/home-controller";
import { HomeWithLayoutController } from "./controllers/web/home-with-layout/home-with-layout-controller"; 
import { AppExceptionHandler } from "./exceptions/app-exception-handler";
import { ConfigurationManager } from "n-config";


class AppInstaller implements ComponentInstaller
{
    public install(registry: Registry): void
    {
        registry
            .registerSingleton("TodoManager", InmemoryTodoManager)
            .registerSingleton("ConfigService", DefaultConfigService)
            .registerSingleton("Logger", ConsoleLogger);
        ;
    }
}

const controllers = [GetTodosController, GetTodoController, CreateTodoController,
    UpdateTodoController, DeleteTodoController, HomeController, HomeWithLayoutController];

const app = new WebApp(ConfigurationManager.getConfig<number>("port"))
    .enableCors()
    .useViewResolutionRoot("test-app/controllers/web")
    .useInstaller(new AppInstaller())
    .registerControllers(...controllers)
    .registerExceptionHandler(AppExceptionHandler);

app.bootstrap();

