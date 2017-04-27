"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Colors = require("colors");
class ConsoleLogger {
    logInfo(info) {
        console.log(Colors.green(`INFO: ${info}`));
        return Promise.resolve();
    }
    logWarning(warning) {
        console.log(Colors.yellow(`INFO: ${warning}`));
        return Promise.resolve();
    }
    logError(error) {
        console.log(Colors.red(`ERROR: ${error.toString()}`));
        return Promise.resolve();
    }
}
exports.ConsoleLogger = ConsoleLogger;
//# sourceMappingURL=consoleLogger.js.map