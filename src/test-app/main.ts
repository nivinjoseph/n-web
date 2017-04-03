import { AppInstaller } from "./ioc/app-installer";
import { WebApp } from "./../index";
import { GetTodosController } from "./controllers/get-todos-controller";
import { GetTodoController } from "./controllers/get-todo-controller";
import { CreateTodoController } from "./controllers/create-todo-controller";
import { UpdateTodoController } from "./controllers/update-todo-controller";
import { DeleteTodoController } from "./controllers/delete-todo-controller";

const app = new WebApp(3000);
app.registerInstaller(new AppInstaller())
    .registerControllers(GetTodosController, GetTodoController, CreateTodoController, UpdateTodoController, DeleteTodoController)
    .bootstrap();
