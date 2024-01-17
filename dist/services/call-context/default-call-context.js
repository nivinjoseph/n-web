import { given } from "@nivinjoseph/n-defensive";
export class DefaultCallContext {
    _ctx;
    _authHeaders;
    _hasAuth = false;
    _authScheme = null;
    _authToken = null;
    get dependencyScope() { return this._ctx.state.scope; }
    get protocol() { return this._ctx.request.protocol; }
    get isSecure() { return this._ctx.request.secure; }
    get href() { return this._ctx.request.href; }
    get url() { return this._ctx.request.URL; }
    get pathParams() { return JSON.parse(JSON.stringify(this._ctx.params)); }
    get queryParams() { return JSON.parse(JSON.stringify(this._ctx.query)); }
    get hasAuth() { return this._hasAuth; }
    get authScheme() { return this._authScheme; }
    get authToken() { return this._authToken; }
    get isAuthenticated() { return this.identity != null; }
    get identity() { return this._ctx.state.identity; }
    get profiler() { return this._ctx.state.profiler; }
    configure(ctx, authHeaders) {
        given(ctx, "ctx").ensureHasValue().ensureIsObject();
        given(authHeaders, "authHeaders").ensureHasValue().ensureIsArray();
        this._ctx = ctx;
        this._authHeaders = authHeaders;
        this._populateSchemeAndToken();
    }
    getRequestHeader(header) {
        given(header, "header").ensureHasValue().ensureIsString().ensure(t => !t.isEmptyOrWhiteSpace());
        return this._ctx.get(header);
    }
    setResponseType(responseType) {
        given(responseType, "responseType")
            .ensureHasValue()
            .ensureIsString()
            .ensure(t => !t.isEmptyOrWhiteSpace());
        this._ctx.response.type = responseType.trim();
    }
    setResponseContentDisposition(contentDisposition) {
        given(contentDisposition, "contentDisposition")
            .ensureHasValue()
            .ensureIsString()
            .ensure(t => !t.isEmptyOrWhiteSpace());
        this._ctx.response.set({
            "Content-Disposition": contentDisposition.trim()
        });
    }
    setResponseHeader(header, value) {
        given(header, "header").ensureHasValue().ensureIsString().ensure(t => !t.isEmptyOrWhiteSpace());
        given(value, "value").ensureHasValue().ensureIsString();
        this._ctx.set(header, value);
    }
    _populateSchemeAndToken() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._ctx.header) {
            for (let i = 0; i < this._authHeaders.length; i++) {
                const authHeader = this._authHeaders[i];
                if (!this._ctx.header[authHeader])
                    continue;
                let authorization = this._ctx.header[authHeader];
                if (authorization.isEmptyOrWhiteSpace())
                    continue;
                authorization = authorization.trim();
                while (authorization.contains("  ")) // double space
                    authorization = authorization.replaceAll("  ", " ");
                const splitted = authorization.split(" ");
                if (splitted.length !== 2)
                    continue;
                const scheme = splitted[0].trim().toLowerCase();
                const token = splitted[1].trim();
                if (scheme.isEmptyOrWhiteSpace() || token.isEmptyOrWhiteSpace())
                    continue;
                this._hasAuth = true;
                this._authScheme = scheme;
                this._authToken = token;
                break;
            }
        }
    }
}
//# sourceMappingURL=default-call-context.js.map