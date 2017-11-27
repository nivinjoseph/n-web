import { Exception } from "n-exception";
import "n-ext";
import { ExceptionHandler } from "./exception-handler";
export declare class DefaultExceptionHandler extends ExceptionHandler {
    private readonly _logToConsole;
    private readonly _handlers;
    constructor(logToConsole?: boolean);
    handle(exp: Exception): Promise<any>;
    protected registerHandler(exceptionType: Function, handler: (e: Exception) => Promise<any>): void;
    protected log(exp: Exception | Error | any): void;
}
