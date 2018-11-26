import { EventHandler, event } from "../../src/index";
import { inject } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
// import { ApplicationException } from "@nivinjoseph/n-exception";
import { Logger } from "@nivinjoseph/n-log";
import { TodoCreated } from "./todo-created";


@event(TodoCreated)
@inject("Logger")
export class TodoCreatedEventNotifyHandler extends EventHandler<TodoCreated>
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
        
        // if (true)
        //     throw new ApplicationException("Foo");

        await this._logger.logInfo(`NOTIFYING ABOUT TODO.`);
    }
}