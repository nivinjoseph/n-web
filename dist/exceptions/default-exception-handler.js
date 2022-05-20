"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultExceptionHandler = void 0;
const tslib_1 = require("tslib");
const n_exception_1 = require("@nivinjoseph/n-exception");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const http_exception_1 = require("./http-exception");
// public
class DefaultExceptionHandler {
    constructor(logger, logEverything = true) {
        this._handlers = {};
        (0, n_defensive_1.given)(logger, "logger").ensureHasValue().ensureIsObject();
        this._logger = logger;
        this._logEverything = !!logEverything;
    }
    handle(exp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._logEverything)
                yield this.log(exp);
            const name = exp.getTypeName();
            const handler = this._handlers[name];
            if (handler)
                return handler(exp);
            else
                throw new http_exception_1.HttpException(500, "There was an error processing your request.");
        });
    }
    registerHandler(exceptionType, handler) {
        (0, n_defensive_1.given)(exceptionType, "exceptionType").ensureHasValue().ensureIsFunction();
        (0, n_defensive_1.given)(handler, "handler").ensureHasValue().ensureIsFunction();
        const name = exceptionType.getTypeName();
        if (this._handlers[name])
            throw new n_exception_1.ApplicationException(`Duplicate handler registration for Exception type '${name}'.`);
        this._handlers[name] = handler;
    }
    log(exp) {
        try {
            let logMessage = "";
            if (exp instanceof n_exception_1.Exception)
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
exports.DefaultExceptionHandler = DefaultExceptionHandler;
//# sourceMappingURL=default-exception-handler.js.map