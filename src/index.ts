import "@nivinjoseph/n-ext";
import { WebApp } from "./web-app.js";
// import { WebpackDevMiddlewareConfig } from "./webpack-dev-middleware-config.js";

import { Controller, ControllerClass } from "./controller.js";
import { route, ControllerRouteDecorator } from "./route.js";
import { httpGet, httpPost, httpPut, httpDelete } from "./http-method.js";
import { query } from "./query.js";
import { command } from "./command.js";
import { view, ControllerViewDecorator } from "./view.js";
import { viewLayout, ControllerViewLayoutDecorator } from "./view-layout.js";
import { Utils } from "./utils.js";

import { HttpException } from "./exceptions/http-exception.js";
import { ExceptionHandler } from "./exceptions/exception-handler.js";
import { DefaultExceptionHandler } from "./exceptions/default-exception-handler.js";

import { CallContext } from "./services/call-context/call-context.js";

import { ApplicationScript } from "./application-script.js";

import { AuthenticationHandler } from "./security/authentication-handler.js";
import { AuthorizationHandler } from "./security/authorization-handler.js";
import { DefaultAuthorizationHandler } from "./security/default-authorization-handler.js";
import { authorize, ControllerAuthorizeDecorator } from "./security/authorize.js";


//@ts-expect-error polyfill to use metadata object
Symbol.metadata ??= Symbol("Symbol.metadata");

export
{
    WebApp, 
    // WebpackDevMiddlewareConfig,
    Controller, ControllerClass,
    route, ControllerRouteDecorator,
    httpGet, httpPost, httpPut, httpDelete,
    query, command,
    view, ControllerViewDecorator,
    viewLayout, ControllerViewLayoutDecorator,
    Utils,
    
    HttpException, ExceptionHandler, DefaultExceptionHandler,
    
    CallContext,
    
    ApplicationScript,
    
    AuthenticationHandler, AuthorizationHandler, DefaultAuthorizationHandler, authorize, ControllerAuthorizeDecorator
};

