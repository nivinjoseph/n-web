import { ApplicationException } from "@nivinjoseph/n-exception";
export declare class RpcException extends ApplicationException {
    private readonly _httpStatusCode;
    private readonly _rpcExceptionCode;
    private readonly _data;
    get statusCode(): number;
    get exceptionCode(): number;
    get data(): RpcExceptionData | null;
    constructor(httpStatusCode: number, data: RpcExceptionData | null);
}
export interface RpcExceptionData {
    readonly exceptionCode: number;
    readonly message: string;
}
//# sourceMappingURL=rpc-exception.d.ts.map