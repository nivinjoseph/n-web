"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const n_exception_1 = require("n-exception");
const n_defensive_1 = require("n-defensive");
require("n-ext");
const exception_handler_1 = require("./exception-handler");
const http_exception_1 = require("./http-exception");
// public
class DefaultExceptionHandler extends exception_handler_1.ExceptionHandler {
    constructor(logToConsole = false) {
        super();
        this._logToConsole = !!logToConsole;
        this._handlers = {};
    }
    handle(exp) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._logToConsole)
                this.log(exp);
            const name = exp.getTypeName();
            const handler = this._handlers[name];
            if (handler)
                yield handler(exp);
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
        let logMessage = "";
        if (exp instanceof n_exception_1.Exception)
            logMessage = exp.toString();
        else if (exp instanceof Error)
            logMessage = exp.stack;
        else
            logMessage = exp.toString();
        console.log(Date.now(), logMessage);
    }
}
exports.DefaultExceptionHandler = DefaultExceptionHandler;
//# sourceMappingURL=default-exception-handler.js.map