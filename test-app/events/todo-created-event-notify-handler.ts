import { EventHandler, event } from "../../src/index";
import { Event } from "./event";
import { inject } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { Logger } from "@nivinjoseph/n-log";


@event(Event.todoCreated)
@inject("Logger")
export class TodoCreatedEventNotifyHandler extends EventHandler
{
    private readonly _logger: Logger;


    public constructor(logger: Logger)
    {
        super();
        given(logger, "logger").ensureHasValue().ensureIsObject();
        this._logger = logger;
    }


    public async handle(): Promise<void>
    {
        if (true)
            throw new ApplicationException("Foo");
        
        await this._logger.logInfo(`NOTIFYING ABOUT TODO.`);
    }
}