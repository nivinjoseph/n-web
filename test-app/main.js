"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inmemory_todo_manager_1 = require("./services/todo-manager/inmemory-todo-manager");
const default_config_service_1 = require("./services/config-service/default-config-service");
const consoleLogger_1 = require("./services/logger/consoleLogger");
const index_1 = require("./../src/index");
const get_todos_controller_1 = require("./controllers/api/get-todos-controller");
const get_todo_controller_1 = require("./controllers/api/get-todo-controller");
const create_todo_controller_1 = require("./controllers/api/create-todo-controller");
const update_todo_controller_1 = require("./controllers/api/update-todo-controller");
const delete_todo_controller_1 = require("./controllers/api/delete-todo-controller");
const home_controller_1 = require("./controllers/web/home/home-controller");
const home_with_layout_controller_1 = require("./controllers/web/home-with-layout/home-with-layout-controller");
const app_exception_handler_1 = require("./exceptions/app-exception-handler");
const n_config_1 = require("n-config");
class AppInstaller {
    install(registry) {
        registry
            .registerSingleton("TodoManager", inmemory_todo_manager_1.InmemoryTodoManager)
            .registerSingleton("ConfigService", default_config_service_1.DefaultConfigService)
            .registerSingleton("Logger", consoleLogger_1.ConsoleLogger);
        ;
    }
}
exports.AppInstaller = AppInstaller;
const controllers = [get_todos_controller_1.GetTodosController, get_todo_controller_1.GetTodoController, create_todo_controller_1.CreateTodoController,
    update_todo_controller_1.UpdateTodoController, delete_todo_controller_1.DeleteTodoController, home_controller_1.HomeController, home_with_layout_controller_1.HomeWithLayoutController];
const app = new index_1.WebApp(n_config_1.ConfigurationManager.getConfig("port"))
    .enableCors()
    .registerInstaller(new AppInstaller())
    .registerControllers(...controllers)
    .registerExceptionHandler(app_exception_handler_1.AppExceptionHandler);
app.bootstrap();
//# sourceMappingURL=main.js.map