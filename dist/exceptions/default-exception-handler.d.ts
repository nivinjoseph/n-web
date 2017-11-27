import { Exception } from "n-exception";
import "n-ext";
import { ExceptionHandler } from "./exception-handler";
import { Logger } from "n-log";
export declare class DefaultExceptionHandler extends ExceptionHandler {
    private readonly _logger;
    private readonly _logEverything;
    private readonly _handlers;
    constructor(logger: Logger, logEverything?: boolean);
    handle(exp: Exception): Promise<any>;
    protected registerHandler(exceptionType: Function, handler: (e: Exception) => Promise<any>): void;
    protected log(exp: Exception | Error | any): Promise<void>;
}
