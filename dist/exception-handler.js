"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { given } from "n-defensive";
var ExceptionHandler = (function () {
    function ExceptionHandler() {
    }
    return ExceptionHandler;
}());
exports.ExceptionHandler = ExceptionHandler;
// export class ExceptionResult
// {
//     private _code: number;
//     private _message: string;
//     public get code(): number { return this._code; }
//     public get message(): string { return this._message; }
//     public constructor(code: number);
//     public constructor(code: number, message: string);
//     public constructor(code: number, message?: string)
//     {
//         given(code, "code").ensureHasValue().ensure(t => t >= 400, "has to be an error code");
//         this._code = code;
//         this._message = message;
//     }
// } 
//# sourceMappingURL=exception-handler.js.map