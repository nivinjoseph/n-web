import { Exception } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";
export declare class HttpException extends Exception {
    private readonly _statusCode;
    private readonly _body;
    get statusCode(): number;
    get body(): any;
    constructor(statusCode: number);
    constructor(statusCode: number, body: any);
}
