import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { RouteParam } from "./route-param.js";
// route format: /api/Product/{id:number}?{name?:string}&{all:boolean}
export class RouteInfo {
    _routeTemplate;
    _routeParams = new Array();
    _routeParamsRegistry = {};
    _koaRoute;
    _isCatchAll;
    _hasQuery = false;
    get route() { return this._routeTemplate; }
    get koaRoute() { return this._koaRoute; }
    get params() { return this._routeParams; }
    get isCatchAll() { return this._isCatchAll; }
    constructor(routeTemplate, isUrlGenerator = false) {
        given(routeTemplate, "routeTemplate")
            .ensureHasValue()
            .ensure(t => !t.isEmptyOrWhiteSpace());
        routeTemplate = routeTemplate.trim().replaceAll(" ", "");
        if (!isUrlGenerator) {
            given(routeTemplate, "routeTemplate")
                .ensure(t => t.startsWith("/"), "has to start with '/'")
                .ensure(t => !t.contains("//"), "cannot contain '//'");
            if (routeTemplate.length > 1 && routeTemplate.endsWith("/"))
                routeTemplate = routeTemplate.substr(0, routeTemplate.length - 1);
        }
        this._routeTemplate = routeTemplate;
        if (this._routeTemplate.contains("*")) {
            this._isCatchAll = true;
        }
        else {
            this._isCatchAll = false;
            this._populateRouteParams();
            if (!isUrlGenerator)
                this._koaRoute = this._generateKoaRoute(this._routeTemplate);
        }
    }
    findRouteParam(key) {
        given(key, "key").ensureHasValue().ensureIsString();
        return this._routeParamsRegistry[key.trim().toLowerCase()];
    }
    generateUrl(values) {
        let url = this._routeTemplate;
        let hasQuery = this._hasQuery;
        for (const key in values) {
            const routeParam = this.findRouteParam(key);
            if (routeParam) {
                const param = "{" + routeParam.param + "}";
                const replacement = routeParam.isQuery
                    ? "{0}={1}".format(key, encodeURIComponent(values.getValue(key)))
                    : encodeURIComponent(values.getValue(key));
                url = url.replace(param, replacement);
            }
            else {
                url = `${url}${hasQuery ? "&" : "?"}${"{0}={1}".format(key, encodeURIComponent(values.getValue(key)))}`;
                hasQuery = true;
            }
        }
        return url;
    }
    _populateRouteParams() {
        let index = 1;
        for (const routeParam of this._extractTemplateParams(this._routeTemplate).map(t => new RouteParam(t))) {
            const key = routeParam.paramKey.toLowerCase();
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (this._routeParamsRegistry[key])
                throw new ApplicationException("Invalid route template. Duplicate route params (case insensitive) detected.");
            routeParam.setOrder(index++);
            this._routeParamsRegistry[key] = routeParam;
            this._routeParams.push(routeParam);
        }
    }
    _extractTemplateParams(routeTemplate) {
        const templateParams = new Array();
        let queryFound = false;
        let startFound = false;
        let startIndex = 0;
        for (let i = 0; i < routeTemplate.length; i++) {
            if (routeTemplate[i] === "?" && !startFound) {
                if (queryFound)
                    throw new ApplicationException("Invalid route template. Unresolvable '?' characters detected.");
                queryFound = true;
            }
            if (routeTemplate[i] === "{") {
                if (startFound)
                    throw new ApplicationException("Invalid route template. Braces do not match.");
                startFound = true;
                startIndex = i + 1;
            }
            else if (routeTemplate[i] === "}") {
                if (!startFound)
                    throw new ApplicationException("Invalid route template. Braces do not match.");
                let value = routeTemplate.substring(startIndex, i);
                value = value.trim();
                if (queryFound)
                    value = value + "[Q]";
                templateParams.push(value);
                startFound = false;
            }
        }
        this._hasQuery = queryFound;
        return templateParams;
    }
    _generateKoaRoute(routeTemplate) {
        // remove all query params
        const hasQueries = this._routeParams.some(t => t.isQuery);
        if (hasQueries) {
            this._routeParams.where(t => t.isQuery)
                .forEach(t => {
                const asItWas = "{" + t.param + "}";
                if (!routeTemplate.contains(asItWas))
                    throw new ApplicationException("Invalid route template." + asItWas);
                routeTemplate = routeTemplate.replace(asItWas, ``);
            });
            // remove ? and &
            routeTemplate = routeTemplate.replaceAll("&", "");
            if (routeTemplate.endsWith("?"))
                routeTemplate = routeTemplate.slice(0, routeTemplate.length - 1);
        }
        this._routeParams
            .where(t => !t.isQuery)
            .forEach(t => {
            const asItWas = "{" + t.param + "}";
            if (!routeTemplate.contains(asItWas))
                throw new ApplicationException("Invalid route template." + asItWas);
            if (t.isOptional)
                routeTemplate = routeTemplate.replace(`/${asItWas}`, `{/:${t.paramKey}}`);
            else
                routeTemplate = routeTemplate.replace(asItWas, `:${t.paramKey}`);
        });
        return routeTemplate;
    }
}
//# sourceMappingURL=route-info.js.map