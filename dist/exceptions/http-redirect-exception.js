import { given } from "@nivinjoseph/n-defensive";
import { Exception } from "@nivinjoseph/n-exception";
export class HttpRedirectException extends Exception {
    _url;
    get url() { return this._url; }
    constructor(url) {
        given(url, "url").ensureHasValue().ensureIsString();
        super("HTTP redirect");
        this._url = url;
    }
}
//# sourceMappingURL=http-redirect-exception.js.map