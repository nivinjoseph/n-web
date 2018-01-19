import { ExceptionHandler } from "./../../src/index";
import { Exception } from "n-exception";
import { TodoNotFoundException } from "./todo-not-found-exception";
import { HttpException } from "./../../src/index";
import { inject } from "n-ject";
import { Logger } from "./../services/logger/logger";
import { given } from "n-defensive";
import { ApplicationException } from "n-exception";


@inject("Logger")
export class AppExceptionHandler extends ExceptionHandler
{
    private readonly _logger: Logger;
    
    
    public constructor(logger: Logger)
    {
        given(logger, "logger").ensureHasValue();
        super();
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