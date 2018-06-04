import { EventHandler, event } from "../../src/index";
import { Event } from "./event";
import { inject } from "@nivinjoseph/n-ject";
import { Logger } from "../services/logger/logger";
import { given } from "@nivinjoseph/n-defensive";


@event(Event.todoCreated)
@inject("Logger")    
export class TodoCreatedEventHandler extends EventHandler
{
    private readonly _logger: Logger;
    
    
    public constructor(logger: Logger)
    {
        super();
        given(logger, "logger").ensureHasValue().ensureIsObject();
        this._logger = logger;
    }
    
    
    public async handle(todoId: number): Promise<void>
    {
        await this._logger.logInfo(`TODO WITH ID ${todoId} CREATED.`);
    }
}