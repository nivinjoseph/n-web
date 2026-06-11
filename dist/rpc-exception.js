import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
// public
export class RpcException extends ApplicationException {
    _httpStatusCode;
    _rpcExceptionCode;
    _data;
    get statusCode() {
        return this._httpStatusCode;
    }
    get exceptionCode() {
        return this._rpcExceptionCode;
    }
    get data() {
        return this._data;
    }
    constructor(httpStatusCode, data) {
        given(httpStatusCode, "httpStatus").ensureHasValue().ensureIsNumber();
        const rpcExceptionCode = data?.exceptionCode ?? 0;
        super(`HTTP status code = ${httpStatusCode}; RPC exception code = ${rpcExceptionCode};`);
        this._httpStatusCode = httpStatusCode;
        this._rpcExceptionCode = rpcExceptionCode;
        this._data = data || null;
    }
}
//# sourceMappingURL=rpc-exception.js.map