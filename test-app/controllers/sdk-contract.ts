// SDK contract: the single place where the client-facing types are derived from the server-side
// source of truth (the controllers + the Routes table). The client SDK (test-app/sdk/todo-sdk.ts)
// consumes these and never references the controllers or Routes shapes directly.
//
// Everything here is a type except the `Routes` value import (needed for `typeof` on the route
// literals); `Routes` is just static strings, so this file carries no real runtime weight, and the
// controller/utility imports are erased entirely under verbatimModuleSyntax.
import type {
    CommandControllerRequestBody,
    CommandControllerResponseBody,
    ControllerRouteParams,
    QueryControllerResponseBody
} from "../../src/index.client.js";
import type { CreateTodoController } from "./api/create-todo-controller.js";
import type { GetTodoController } from "./api/get-todo-controller.js";
import type { GetTodosController } from "./api/get-todos-controller.js";
import { Routes } from "./routes.js";


// Re-exported so the client SDK consumes the route table from the same contract module as its types.
export { Routes };

// Response/request bodies extracted from the controllers. If a controller's TResBody/TReqBody
// changes, these update automatically.
export type GetTodoRes = QueryControllerResponseBody<GetTodoController>;
export type GetTodosRes = QueryControllerResponseBody<GetTodosController>;
export type CreateTodoReq = CommandControllerRequestBody<CreateTodoController>;
export type CreateTodoRes = CommandControllerResponseBody<CreateTodoController>;

// Request params extracted from the route definitions. Rename/retype a route param and every
// consumer becomes a compile error until updated.
export type GetTodoParams = ControllerRouteParams<typeof Routes.query.getTodo>;
export type GetTodosParams = ControllerRouteParams<typeof Routes.query.getTodos>;
