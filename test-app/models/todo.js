"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Todo {
    get id() { return this._id; }
    get title() { return this._title; }
    get description() { return this._description; }
    constructor(id, title, description) {
        this._id = id;
        this._title = title;
        this._description = description;
    }
}
exports.Todo = Todo;
//# sourceMappingURL=todo.js.map