import { Exception, ApplicationException } from "@nivinjoseph/n-exception";
import { given } from "@nivinjoseph/n-defensive";
import { ExceptionHandler } from "./exception-handler";
import { HttpException } from "./http-exception";
import { Logger } from "@nivinjoseph/n-log";
import { ClassDefinition } from "@nivinjoseph/n-util";

// public
export class DefaultExceptionHandler implements ExceptionHandler
{
    private readonly _logger: Logger;
    private readonly _logEverything: boolean;
    private readonly _handlers: Record<string, ((exp: Exception) => Promise<any>) | null> = {};


    public constructor(logger: Logger, logEverything = true)
    {
        given(logger, "logger").ensureHasValue().ensureIsObject();
        this._logger = logger;
        
        this._logEverything = !!logEverything;
    }


    public async handle(exp: Exception): Promise<any>
    {
        if (this._logEverything)
            await this.log(exp);

        const name = (<Object>exp).getTypeName();
        const handler = this._handlers[name];
        if (handler)
            return handler(exp);
        else
            throw new HttpException(500, "There was an error processing your request.");
    }


    protected registerHandler<T extends Exception>(exceptionType: ClassDefinition<T>, handler: (e: T) => Promise<any>): void
    {
        given(exceptionType, "exceptionType").ensureHasValue().ensureIsFunction();
        given(handler, "handler").ensureHasValue().ensureIsFunction();

        const name = (<Object>exceptionType).getTypeName();
        if (this._handlers[name])
            throw new ApplicationException(`Duplicate handler registration for Exception type '${name}'.`);

        this._handlers[name] = handler as (exp: Exception) => Promise<any>;
    }

    protected log(exp: Exception | Error | any): Promise<void>
    {
        try 
        {
            let logMessage = "";
            if (exp instanceof Exception)
                logMessage = exp.toString();
            else if (exp instanceof Error)
                logMessage = exp.stack!;
            else
                logMessage = (<object>exp).toString();

            return this._logger.logError(logMessage);
        }
        catch (error)
        {
            return this._logger.logError("There was an error while attempting to log another error.");
        }
    }
}