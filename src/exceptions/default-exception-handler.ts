import { Exception, ApplicationException } from "n-exception";
import { given } from "n-defensive";
import "n-ext";
import { ExceptionHandler } from "./exception-handler";
import { HttpException } from "./http-exception";

// public
export class DefaultExceptionHandler extends ExceptionHandler
{
    private readonly _logToConsole: boolean;
    private readonly _handlers: { [index: string]: (exp: Exception) => Promise<any> };


    public constructor(logToConsole = false)
    {
        super();
        this._logToConsole = !!logToConsole;
        this._handlers = {};
    }


    public async handle(exp: Exception): Promise<any>
    {
        if (this._logToConsole)
            this.log(exp);

        const name = (<Object>exp).getTypeName();
        const handler = this._handlers[name];
        if (handler)
            await handler(exp);
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

    protected log(exp: Exception | Error | any): void
    {
        let logMessage = "";
        if (exp instanceof Exception)
            logMessage = exp.toString();
        else if (exp instanceof Error)
            logMessage = exp.stack;
        else
            logMessage = exp.toString();
        
        console.log(Date.now(), logMessage);
    }
}