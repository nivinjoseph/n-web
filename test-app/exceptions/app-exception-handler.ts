import { ExceptionHandler } from "./../../src/index";
import { Exception } from "@nivinjoseph/n-exception";
import { TodoNotFoundException } from "./todo-not-found-exception";
import { HttpException } from "./../../src/index";
import { inject } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
import { Logger } from "@nivinjoseph/n-log";


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
            await this.handleTodoNotFoundException(exp as TodoNotFoundException);
        }    
        else
        {
            await this._logger.logError(exp);
            throw new HttpException(500, "We encountered a problem while processing your request");
        }    
    }
        
    private async handleTodoNotFoundException(exp: TodoNotFoundException): Promise<any>
    {
        await this._logger.logError(exp);
        throw new HttpException(404, "todo not found");
    }
}