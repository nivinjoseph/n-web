// SDK contract: the single place where the client-facing types are derived from the server-side
// source of truth (the controllers + the Routes table). The client SDK (test-app/sdk/todo-sdk.ts)
// consumes these and never references the controllers or Routes shapes directly.
//
// Everything here is a type except the `Routes` value import (needed for `typeof` on the route
// literals); `Routes` is just static strings, so this file carries no real runtime weight, and the
// controller/utility imports are erased entirely under verbatimModuleSyntax.
import type { CommandEndpoint, QueryEndpoint } from "../../src/index.client.js";
import type { CreateTodoController } from "./api/create-todo-controller.js";
import type { GetTodoController } from "./api/get-todo-controller.js";
import type { GetTodosController } from "./api/get-todos-controller.js";
import { Routes } from "./routes.js";


// Re-exported so the client SDK consumes the route table from the same contract module as its types.
export { Routes };

// Endpoint contracts: each bundles a route literal with the controller that serves it, so the route,
// its resolved params, the request body, and the response body are all validated together against
// the server. These are the single source of truth for the client SDK.
export type GetTodoEndpoint = QueryEndpoint<typeof Routes.query.getTodo, GetTodoController>;
export type GetTodosEndpoint = QueryEndpoint<typeof Routes.query.getTodos, GetTodosController>;
export type CreateTodoEndpoint = CommandEndpoint<typeof Routes.command.createTodo, CreateTodoController>;

// Granular aliases derived from the endpoints above, for ergonomic SDK method signatures. Change a
// route param or a controller body and these (and every consumer) become compile errors until updated.
export type GetTodoParams = GetTodoEndpoint["params"];
export type GetTodoRes = GetTodoEndpoint["res"];
export type GetTodosParams = GetTodosEndpoint["params"];
export type GetTodosRes = GetTodosEndpoint["res"];
export type CreateTodoReq = CreateTodoEndpoint["req"];
export type CreateTodoRes = CreateTodoEndpoint["res"];
