"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_exception_1 = require("@nivinjoseph/n-exception");
require("@nivinjoseph/n-ext");
class InvalidScheduleException extends n_exception_1.Exception {
    constructor(message) {
        super(message);
    }
}
exports.InvalidScheduleException = InvalidScheduleException;
//# sourceMappingURL=InvalidScheduleException.js.map