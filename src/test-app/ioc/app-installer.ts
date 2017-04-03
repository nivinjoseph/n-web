import { ComponentInstaller, Registry } from "n-ject";
import { InmemoryTodoManager } from "./../services/inmemory-todo-manager";

export class AppInstaller implements ComponentInstaller
{
    public install(registry: Registry): void
    {
        registry
            .registerSingleton("todoManager", InmemoryTodoManager);
    }
}