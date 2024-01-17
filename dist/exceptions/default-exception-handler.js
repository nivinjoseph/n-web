import { Exception, ApplicationException } from "@nivinjoseph/n-exception";
import { given } from "@nivinjoseph/n-defensive";
import { HttpException } from "./http-exception.js";
// public
export class DefaultExceptionHandler {
    _logger;
    _logEverything;
    _handlers = {};
    constructor(logger, logEverything = true) {
        given(logger, "logger").ensureHasValue().ensureIsObject();
        this._logger = logger;
        this._logEverything = !!logEverything;
    }
    async handle(exp) {
        if (this._logEverything)
            await this.log(exp);
        const name = exp.getTypeName();
        const handler = this._handlers[name];
        if (handler)
            return handler(exp);
        else
            throw new HttpException(500, "There was an error processing your request.");
    }
    registerHandler(exceptionType, handler) {
        given(exceptionType, "exceptionType").ensureHasValue().ensureIsFunction();
        given(handler, "handler").ensureHasValue().ensureIsFunction();
        const name = exceptionType.getTypeName();
        if (this._handlers[name])
            throw new ApplicationException(`Duplicate handler registration for Exception type '${name}'.`);
        this._handlers[name] = handler;
    }
    log(exp) {
        try {
            let logMessage = "";
            if (exp instanceof Exception)
                logMessage = exp.toString();
            else if (exp instanceof Error)
                logMessage = exp.stack;
            else
                logMessage = exp.toString();
            return this._logger.logError(logMessage);
        }
        catch (error) {
            return this._logger.logError("There was an error while attempting to log another error.");
        }
    }
}
//# sourceMappingURL=default-exception-handler.js.map