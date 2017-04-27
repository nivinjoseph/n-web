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
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("n-defensive");
const index_1 = require("./../../../src/index");
const Routes = require("./../routes");
const n_ject_1 = require("n-ject");
let DeleteTodoController = class DeleteTodoController extends index_1.Controller {
    constructor(todoManager) {
        n_defensive_1.given(todoManager, "todoManager").ensureHasValue();
        super();
        this._todoManager = todoManager;
    }
    execute(id) {
        return this._todoManager.deleteTodo(id);
    }
};
DeleteTodoController = __decorate([
    index_1.httpDelete,
    index_1.route(Routes.deleteTodo),
    n_ject_1.inject("TodoManager"),
    __metadata("design:paramtypes", [Object])
], DeleteTodoController);
exports.DeleteTodoController = DeleteTodoController;
//# sourceMappingURL=delete-todo-controller.js.map