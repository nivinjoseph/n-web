import "@nivinjoseph/n-ext";
import { command } from "./command.js";
import { Controller, type ControllerClass } from "./controller.js";
import { httpDelete, httpGet, httpPost, httpPut } from "./http-method.js";
import { query } from "./query.js";
import { route, type ControllerRouteDecorator } from "./route.js";
import { Utils } from "./utils.js";
import { viewLayout, type ControllerViewLayoutDecorator } from "./view-layout.js";
import { view, type ControllerViewDecorator } from "./view.js";
import { WebApp } from "./web-app.js";

import { DefaultExceptionHandler } from "./exceptions/default-exception-handler.js";
import { type ExceptionHandler } from "./exceptions/exception-handler.js";
import { HttpException } from "./exceptions/http-exception.js";

import { type CallContext } from "./services/call-context/call-context.js";

import { type ApplicationScript } from "./application-script.js";

import { type AuthenticationHandler } from "./security/authentication-handler.js";
import { type AuthorizationHandler } from "./security/authorization-handler.js";
import { authorize, type ControllerAuthorizeDecorator } from "./security/authorize.js";
import { DefaultAuthorizationHandler } from "./security/default-authorization-handler.js";


//@ts-expect-error polyfill to use metadata object
Symbol.metadata ??= Symbol("Symbol.metadata");

export
{
    authorize, command, Controller, DefaultAuthorizationHandler, DefaultExceptionHandler, httpDelete,
    HttpException, httpGet, httpPost, httpPut, query, route, Utils, view, viewLayout, WebApp
};
export type {
    ApplicationScript,

    AuthenticationHandler, AuthorizationHandler, CallContext, ControllerAuthorizeDecorator,
    ControllerClass, ControllerRouteDecorator, ControllerViewDecorator, ControllerViewLayoutDecorator, ExceptionHandler
};


