import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";

// public
export class RpcException extends ApplicationException
{
    private readonly _httpStatusCode: number;
    private readonly _rpcExceptionCode: number;
    private readonly _data: RpcExceptionData | null;

    public get statusCode(): number
    {
        return this._httpStatusCode;
    }
    public get exceptionCode(): number
    {
        return this._rpcExceptionCode;
    }
    public get data(): RpcExceptionData | null
    {
        return this._data;
    }

    public constructor(httpStatusCode: number, data: RpcExceptionData | null)
    {
        given(httpStatusCode, "httpStatus").ensureHasValue().ensureIsNumber();

        const rpcExceptionCode: number = data?.exceptionCode ?? 0;

        super(
            `HTTP status code = ${httpStatusCode}; RPC exception code = ${rpcExceptionCode};`
        );

        this._httpStatusCode = httpStatusCode;
        this._rpcExceptionCode = rpcExceptionCode;
        this._data = data || null;
    }
}

// public
export interface RpcExceptionData
{
    readonly exceptionCode: number;
    readonly message: string;
}
