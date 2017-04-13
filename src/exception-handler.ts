import { Exception } from "n-exception";
// import { given } from "n-defensive";

export abstract class ExceptionHandler
{
    public abstract handle(exp: Exception): Promise<any>;
}

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