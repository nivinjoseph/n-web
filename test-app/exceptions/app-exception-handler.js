"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./../../src/index");
const todo_not_found_exception_1 = require("./todo-not-found-exception");
const index_2 = require("./../../src/index");
const n_ject_1 = require("n-ject");
const n_defensive_1 = require("n-defensive");
let AppExceptionHandler = class AppExceptionHandler extends index_1.ExceptionHandler {
    constructor(logger) {
        n_defensive_1.given(logger, "logger").ensureHasValue();
        super();
        this._logger = logger;
    }
    handle(exp) {
        return __awaiter(this, void 0, void 0, function* () {
            if (exp instanceof todo_not_found_exception_1.TodoNotFoundException) {
                yield this.handleTodoNotFoundException(exp);
            }
            else {
                yield this._logger.logError(exp);
                throw new index_2.HttpException(500, "We encountered a problem while processing your request");
            }
        });
    }
    handleTodoNotFoundException(exp) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._logger.logError(exp);
            throw new index_2.HttpException(404, "todo not found");
        });
    }
};
AppExceptionHandler = __decorate([
    n_ject_1.inject("Logger"),
    __metadata("design:paramtypes", [Object])
], AppExceptionHandler);
exports.AppExceptionHandler = AppExceptionHandler;
//# sourceMappingURL=app-exception-handler.js.map