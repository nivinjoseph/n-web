import { EventHandler, event } from "../../src/index";
import { inject } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
import { Logger } from "@nivinjoseph/n-log";
import { TodoCreated } from "./todo-created";


@event(TodoCreated)
@inject("Logger")    
export class TodoCreatedEventHandler extends EventHandler<TodoCreated>
{
    private readonly _logger: Logger;
    
    
    public constructor(logger: Logger)
    {
        super();
        given(logger, "logger").ensureHasValue().ensureIsObject();
        this._logger = logger;
    }
    
    
    public async handle(event: TodoCreated): Promise<void>
    {
        given(event, "event").ensureHasValue().ensureIsType(TodoCreated);
        
        await this._logger.logInfo(`TODO WITH ID ${event.todoId} CREATED.`);
    }
}