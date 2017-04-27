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
const todo_1 = require("./../../models/todo");
require("n-ext");
const n_exception_1 = require("n-exception");
const n_defensive_1 = require("n-defensive");
const n_ject_1 = require("n-ject");
let InmemoryTodoManager = class InmemoryTodoManager {
    constructor(logger) {
        this._todos = [];
        n_defensive_1.given(logger, "logger").ensureHasValue();
        this._logger = logger;
    }
    getTodos() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._logger.logInfo("Getting TODOs");
            return this._todos.map(t => t);
        });
    }
    addTodo(title, description) {
        return __awaiter(this, void 0, void 0, function* () {
            n_defensive_1.given(title, "title").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
            let lastId = this._todos.length === 0 ? 0 : this._todos.orderByDesc(t => t.id)[0].id;
            let todo = new todo_1.Todo(lastId + 1, title, description);
            this._todos.push(todo);
            yield this._logger.logInfo(`Added TODO with id ${todo.id}`);
            return todo;
        });
    }
    updateTodo(id, title, description) {
        return __awaiter(this, void 0, void 0, function* () {
            n_defensive_1.given(id, "id").ensureHasValue().ensure(t => t > 0);
            n_defensive_1.given(title, "title").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
            let todo = this._todos.find(t => t.id === id);
            if (todo == null)
                throw new n_exception_1.ApplicationException("Todo with id {0} not found.".format(id));
            this._todos.remove(todo);
            todo = new todo_1.Todo(todo.id, title, description);
            this._todos.push(todo);
            yield this._logger.logInfo(`Updated TODO with id ${todo.id}`);
            return todo;
        });
    }
    deleteTodo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            n_defensive_1.given(id, "id").ensureHasValue();
            let todo = this._todos.find(t => t.id === id);
            if (todo == null) {
                yield this._logger.logError(`Attempted to delete non existent TODO with id ${id}.`);
                return;
            }
            this._todos.remove(todo);
            yield this._logger.logWarning(`TODO with id ${id} deleted.`);
        });
    }
};
InmemoryTodoManager = __decorate([
    n_ject_1.inject("Logger"),
    __metadata("design:paramtypes", [Object])
], InmemoryTodoManager);
exports.InmemoryTodoManager = InmemoryTodoManager;
//# sourceMappingURL=inmemory-todo-manager.js.map