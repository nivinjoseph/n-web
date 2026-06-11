import { given } from "@nivinjoseph/n-defensive";
import { RouteInfo } from "./route-info.js";
// public
export class Utils // static class
 {
    static generateUrl(route, params, baseUrl) {
        given(route, "route").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        if (params)
            given(params, "params").ensureIsObject();
        if (baseUrl)
            given(baseUrl, "baseUrl").ensureIsString();
        let url = route.trim().replaceAll(" ", "");
        if (baseUrl != null && baseUrl.isNotEmptyOrWhiteSpace()) {
            baseUrl = baseUrl.trim().replaceAll(" ", "");
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            if (url.startsWith("/"))
                url = url.substr(1, url.length - 1);
            // special treatment for the sake of docker routing on ECS
            const splittedBaseUrl = baseUrl.split("/");
            const popped = splittedBaseUrl.pop()?.toLowerCase();
            if (popped != null && url.toLowerCase().startsWith(popped))
                baseUrl = splittedBaseUrl.join("/");
            url = baseUrl + "/" + url;
        }
        return params ? new RouteInfo(url, true).generateUrl(params) : url;
    }
}
//# sourceMappingURL=utils.js.map