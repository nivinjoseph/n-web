import { AppInstaller } from "./app/ioc/app-installer";
import { WebApp } from "./core/web-app";
import { GetTodosController } from "./app/controllers/get-todos-controller";
import { GetTodoController } from "./app/controllers/get-todo-controller";
import { CreateTodoController } from "./app/controllers/create-todo-controller";
import { UpdateTodoController } from "./app/controllers/update-todo-controller";
import { DeleteTodoController } from "./app/controllers/delete-todo-controller";

const app = new WebApp(3000);
app.registerInstaller(new AppInstaller())
    .registerControllers(GetTodosController, GetTodoController, CreateTodoController, UpdateTodoController, DeleteTodoController)
    .bootstrap();
