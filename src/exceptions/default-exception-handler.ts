import { Exception, ApplicationException } from "@nivinjoseph/n-exception";
import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import { ExceptionHandler } from "./exception-handler";
import { HttpException } from "./http-exception";
import { Logger, ConsoleLogger } from "@nivinjoseph/n-log";

// public
export class DefaultExceptionHandler extends ExceptionHandler
{
    private readonly _logger: Logger;
    private readonly _logEverything: boolean;
    private readonly _handlers: { [index: string]: (exp: Exception) => Promise<any> };


    public constructor(logger: Logger, logEverything = false)
    {
        super();
        this._logger = logger ? logger : new ConsoleLogger();
        this._logEverything = !!logEverything;
        this._handlers = {};
    }


    public async handle(exp: Exception): Promise<any>
    {
        if (this._logEverything)
            await this.log(exp);

        const name = (<Object>exp).getTypeName();
        const handler = this._handlers[name];
        if (handler)
            return await handler(exp);
        else
            throw new HttpException(500, "There was an error processing your request.");
    }


    protected registerHandler(exceptionType: Function, handler: (e: Exception) => Promise<any>): void
    {
        given(exceptionType, "exceptionType").ensureHasValue().ensureIsFunction();
        given(handler, "handler").ensureHasValue().ensureIsFunction();

        const name = (<Object>exceptionType).getTypeName();
        if (this._handlers[name])
            throw new ApplicationException(`Duplicate handler registration for Exception type '${name}'.`);

        this._handlers[name] = handler;
    }

    protected log(exp: Exception | Error | any): Promise<void>
    {
        let logMessage = "";
        if (exp instanceof Exception)
            logMessage = exp.toString();
        else if (exp instanceof Error)
            logMessage = exp.stack;
        else
            logMessage = exp.toString();
        
        return this._logger.logError(logMessage);
    }
}