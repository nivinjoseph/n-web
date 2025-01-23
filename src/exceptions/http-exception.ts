import { given } from "@nivinjoseph/n-defensive";
import { Exception } from "@nivinjoseph/n-exception";

export class HttpException extends Exception
{
    private static readonly _validStatusCodes = [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410,
        411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451,
        500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511];
    
    private readonly _statusCode: number;
    private readonly _body: unknown;
    
    
    public get statusCode(): number { return this._statusCode; }
    public get body(): unknown { return this._body; }
    
    
    public constructor(statusCode: number, body?: unknown)
    {
        given(statusCode, "statusCode").ensureHasValue().ensureIsNumber()
            .ensure(t => HttpException._validStatusCodes.contains(t));
        
        super("HTTP status {0}".format(statusCode.toString()));
        
        this._statusCode = statusCode;
        this._body = body;
    }
}