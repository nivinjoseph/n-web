"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultExceptionHandler = void 0;
const n_exception_1 = require("@nivinjoseph/n-exception");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
require("@nivinjoseph/n-ext");
const http_exception_1 = require("./http-exception");
// public
class DefaultExceptionHandler {
    constructor(logger, logEverything = true) {
        this._logger = logger;
        this._logEverything = !!logEverything;
        this._handlers = {};
    }
    handle(exp) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._logEverything)
                yield this.log(exp);
            const name = exp.getTypeName();
            const handler = this._handlers[name];
            if (handler)
                return yield handler(exp);
            else
                throw new http_exception_1.HttpException(500, "There was an error processing your request.");
        });
    }
    registerHandler(exceptionType, handler) {
        n_defensive_1.given(exceptionType, "exceptionType").ensureHasValue().ensureIsFunction();
        n_defensive_1.given(handler, "handler").ensureHasValue().ensureIsFunction();
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