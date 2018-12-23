import { Exception } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";
import { ExceptionHandler } from "./exception-handler";
import { Logger } from "@nivinjoseph/n-log";
export declare class DefaultExceptionHandler extends ExceptionHandler {
    private readonly _logger;
    private readonly _logEverything;
    private readonly _handlers;
    constructor(logger: Logger, logEverything?: boolean);
    handle(exp: Exception): Promise<any>;
    protected registerHandler<T extends Exception>(exceptionType: Function, handler: (e: T) => Promise<any>): void;
    protected log(exp: Exception | Error | any): Promise<void>;
}
