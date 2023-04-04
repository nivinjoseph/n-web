import { Exception } from "@nivinjoseph/n-exception";
import { ExceptionHandler } from "./exception-handler";
import { Logger } from "@nivinjoseph/n-log";
import { ClassDefinition } from "@nivinjoseph/n-util";
export declare class DefaultExceptionHandler implements ExceptionHandler {
    private readonly _logger;
    private readonly _logEverything;
    private readonly _handlers;
    constructor(logger: Logger, logEverything?: boolean);
    handle(exp: Exception): Promise<any>;
    protected registerHandler<T extends Exception>(exceptionType: ClassDefinition<T>, handler: (e: T) => Promise<any>): void;
    protected log(exp: Exception | Error | any): Promise<void>;
}
//# sourceMappingURL=default-exception-handler.d.ts.map