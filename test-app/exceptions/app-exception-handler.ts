import { given } from "@nivinjoseph/n-defensive";
import { Exception } from "@nivinjoseph/n-exception";
import { inject } from "@nivinjoseph/n-ject";
import { type Logger } from "@nivinjoseph/n-log";
import { HttpException, type ExceptionHandler } from "./../../src/index.js";
import { TodoNotFoundException } from "./todo-not-found-exception.js";


@inject("Logger")
export class AppExceptionHandler implements ExceptionHandler
{
    private readonly _logger: Logger;
    
    
    public constructor(logger: Logger)
    {
        given(logger, "logger").ensureHasValue();
        this._logger = logger;
    }
    
    
    public async handle(exp: Exception): Promise<any>
    {        
        if (exp instanceof TodoNotFoundException)
        {
            await this._handleTodoNotFoundException(exp);
        }    
        else
        {
            await this._logger.logError(exp);
            throw new HttpException(500, "We encountered a problem while processing your request");
        }    
    }
        
    private async _handleTodoNotFoundException(exp: TodoNotFoundException): Promise<any>
    {
        await this._logger.logError(exp);
        throw new HttpException(404, "todo not found");
    }
}