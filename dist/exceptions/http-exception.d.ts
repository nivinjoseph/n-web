import { Exception } from "@nivinjoseph/n-exception";
export declare class HttpException extends Exception {
    private static readonly _validStatusCodes;
    private readonly _statusCode;
    private readonly _body;
    get statusCode(): number;
    get body(): unknown;
    constructor(statusCode: number, body?: unknown);
}
