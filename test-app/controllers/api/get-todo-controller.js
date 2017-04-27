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
const n_defensive_1 = require("n-defensive");
const index_1 = require("./../../../src/index");
const Routes = require("./../routes");
const todo_not_found_exception_1 = require("./../../exceptions/todo-not-found-exception");
const n_ject_1 = require("n-ject");
let GetTodoController = class GetTodoController extends index_1.Controller {
    constructor(todoManager, configService) {
        n_defensive_1.given(todoManager, "todoManager").ensureHasValue();
        n_defensive_1.given(configService, "configService").ensureHasValue();
        super();
        this._todoManager = todoManager;
        this._configService = configService;
    }
    execute(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let todos = yield this._todoManager.getTodos();
            let todo = todos.find(t => t.id === id);
            if (todo == null)
                throw new todo_not_found_exception_1.TodoNotFoundException(id);
            let baseUrl = yield this._configService.getBaseUrl();
            return {
                id: todo.id,
                title: todo.title,
                description: todo.description,
                links: {
                    self: this.generateUrl(Routes.getTodo, { id: todo.id }, baseUrl),
                    update: this.generateUrl(Routes.updateTodo, { id: todo.id }, baseUrl),
                    delete: this.generateUrl(Routes.deleteTodo, { id: todo.id }, baseUrl)
                }
            };
        });
    }
};
GetTodoController = __decorate([
    index_1.query,
    index_1.route(Routes.getTodo),
    n_ject_1.inject("TodoManager", "ConfigService"),
    __metadata("design:paramtypes", [Object, Object])
], GetTodoController);
exports.GetTodoController = GetTodoController;
//# sourceMappingURL=get-todo-controller.js.map