"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_exception_1 = require("n-exception");
require("n-ext");
class TodoNotFoundException extends n_exception_1.ApplicationException {
    constructor(id) {
        super("Todo with id '{0}' not found".format(id));
    }
}
exports.TodoNotFoundException = TodoNotFoundException;
//# sourceMappingURL=todo-not-found-exception.js.map