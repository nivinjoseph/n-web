# n-web


## Overview
n-web is a modern, TypeScript-based web framework built on top of Koa.js. It provides a robust set of features for building web applications, including routing, authentication, authorization, exception handling, and more.

## Table of Contents
1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Core Concepts](#core-concepts)
   - [Controllers](#controllers)
   - [Routing](#routing)
   - [Dependency Injection](#dependency-injection)
4. [Advanced Features](#advanced-features)
5. [Type-Safe Client SDKs](#type-safe-client-sdks)
6. [Complete Example](#complete-example)

## Installation

```bash
# Using npm
npm install @nivinjoseph/n-web

# Using yarn
yarn add @nivinjoseph/n-web
```

## Quick Start

```typescript
import { WebApp } from "@nivinjoseph/n-web";

const app = new WebApp(3000, "localhost");

// Register controllers
app.registerControllers(GetUsersController, GetUserController, CreateUserController);

// Enable features
app.enableCors()
   .enableCompression();

// Start the application
app.bootstrap();
```

## Core Concepts

### Controllers

Controllers are the primary way to handle HTTP requests in n-web. There are three main types of controllers:

#### 1. Query Controllers
Query controllers are used for read-only operations that don't modify state.

```typescript
import { Controller, route, query } from "@nivinjoseph/n-web";
import { given } from "@nivinjoseph/n-defensive";

@query
@route("/api/users")
export class GetUsersController extends Controller {
    public async execute(): Promise<Array<UserModel>> {
        // Get all users logic here
        return [
            {
                name: "John Doe",
                email: "john@example.com",
                age: 30
            },
            {
                name: "Jane Smith",
                email: "jane@example.com",
                age: 25
            }
        ];
    }
}
```

#### 2. Command Controllers
Command controllers are used for operations that modify state.

```typescript
import { Controller, route, command } from "@nivinjoseph/n-web";
import { given } from "@nivinjoseph/n-defensive";

@command
@route("/api/createUser")
export class CreateUserController extends Controller {
    public async execute(model: UserModel): Promise<UserModel> {
        given(model, "model").ensureHasValue().ensureIsObject();
        
        // Create user logic here
        return model;
    }
}

interface UserModel {
    name: string;
    email: string;
    age: number;
}
```

#### 3. HTTP Method Controllers
For more granular control, you can use specific HTTP method decorators.

```typescript
// GET Example - Get user by ID
@httpGet
@route("/api/user/{id: string}")
export class GetUserController extends Controller {
    public async execute(id: string): Promise<UserModel> {
        given(id, "id").ensureHasValue().ensureIsString();
        
        // Get user logic here
        return {
            name: "John Doe",
            email: "john@example.com",
            age: 30
        };
    }
}

// POST Example - Create new user
@httpPost
@route("/api/createUser")
export class CreateUserController extends Controller {
    public async execute(model: UserModel): Promise<UserModel> {
        given(model, "model").ensureHasValue().ensureIsObject();
        
        // Create user logic here
        return model;
    }
}


// PUT Example - Update user
@httpPut
@route("/api/user/{id: string}")
export class UpdateUserController extends Controller {
    public async execute(id: string, model: UserModel): Promise<UserModel> {
        given(id, "id").ensureHasValue().ensureIsString();
        given(model, "model").ensureHasValue().ensureIsObject();
        
        // Update user logic here
        return model;
    }
}

// DELETE Example - Delete user
@httpDelete
@route("/api/user/{id: string}")
export class DeleteUserController extends Controller {
    public async execute(id: string): Promise<void> {
        given(id, "id").ensureHasValue().ensureIsString();
        
        // Delete user logic here
    }
}
```

### Routing

Routes are defined using the `@route` decorator. The framework supports path parameters and query parameters with type safety.

#### Path Parameters
Path parameters are defined using `{paramName: type}` syntax. Supported types are `string`, `number`, and `boolean`.

```typescript
// Required path parameters
@route("/api/users/{id: string}")

// Multiple path parameters
@route("/api/users/{userId: string}/posts/{postId: number}")

// Optional path parameters
@route("/api/users/{userId: string}/posts/{page?: number}")

```

#### Query Parameters
Query parameters are added after `?` and joined with `&`.
Query parameters are defined using `{paramName: type}` syntax. Supported types are `string`, `number`, and `boolean`.

```typescript
// Required query parameters
@route("/api/searchUsers?{search: string}")

// Multiple query parameters
@route("/api/searchUsers?{search: string}&{pageNumber: number}")

// Optional query parameters
@route("/api/search?{query: string}&{page?: number}&{isExactMatch?: boolean}")
```

#### Combined Parameters
Path and query parameters can be combined in the same route:

```typescript
@route("/api/users/{id: string}/posts?{category: string}&{isPublished?: boolean}")
```

> These same typed templates can be reused on the client to build a fully type-checked SDK — see [Type-Safe Client SDKs](#type-safe-client-sdks).

### Dependency Injection

n-web uses the n-ject package for IOC (Inversion of Control) container-based dependency injection. This allows for loose coupling and easier testing of components.

```typescript
import { Container } from "@nivinjoseph/n-ject";
import { inject } from "@nivinjoseph/n-ject";

// 1. Create and configure the container
const container = new Container();

// 2. Register dependencies
container
    .registerSingleton("UserService", UserService)
    .registerScoped("UserRepository", UserRepository);

// 3. Use in controllers
@query
@route("/api/users")
@inject("UserRepository") 
export class UsersController extends Controller {
    private readonly _userRepository: UserRepository;

    public constructor(userRepository: UserRepository) {
        super();
        
        given(userRepository,"userRepository").ensureHasValue().ensureIsObject();
        this._userRepository = userRepository;
    }

    public async execute(): Promise<Array<UserModel>> {
        return await this._userRepository.getAllUsers();
    }
}

// 4. Register the container with the WebApp
const app = new WebApp(3000, "localhost", container);
```

The IOC container supports different registration types:
- `registerSingleton`: Creates a single instance for the entire application
- `registerScoped`: Creates a new instance per request
- `registerTransient`: Creates a new instance every time it's requested


## Advanced Features

### 1. Authentication & Authorization
```typescript
app.registerAuthenticationHandler(MyAuthHandler, "authorization");
app.registerAuthorizationHandler(MyAuthzHandler);
```

### 2. Static File Serving
```typescript
app.registerStaticFilePath("/public", true, false);
```

### 3. WebSocket Support
```typescript
app.enableWebSockets("*", redisClient);
```

### 4. Startup and Shutdown Scripts
```typescript
app.registerStartupScript(MyStartupScript);
app.registerShutdownScript(MyShutdownScript);
```

## Type-Safe Client SDKs

A route template already encodes its parameter names and types (`{id: string}`, `{$search?: string}`), and a controller already declares its request/response body types. n-web lets you **reuse both as the source of truth** to build a client SDK that is fully type-checked against the server — rename a route param or change a controller's body type and the SDK (and every call site) stops compiling until it's fixed.

The pieces fit together as: **a controller declares the route it serves → an endpoint type derives the route, params, and bodies from that controller → one generic argument to `RpcClient`**. Because the route lives on the controller (and `@route` is forced to match it), nothing downstream can drift. A pure client doesn't need the server framework, so all of this ships from a lightweight `/client` entry point.

### The building blocks

| Export | From | Purpose |
| --- | --- | --- |
| `RpcClient` | `@nivinjoseph/n-web/client` | A type-safe HTTP client. `query`/`command` each take a **single endpoint type** as their generic, so the route, params, request body, and response body are all validated together. Handles url generation, base-url joining, JSON, timeouts, and error handling. |
| `QueryEndpoint<TController>` | `@nivinjoseph/n-web/client` | Derives a full contract — `{ route, params, res }` — from the `QueryController` that serves it. The route comes from the controller's *own declared route*, so there is no route argument that can be wrong. |
| `CommandEndpoint<TController>` | `@nivinjoseph/n-web/client` | Like `QueryEndpoint`, plus `req` — `{ route, params, req, res }`, all derived from the `CommandController`. |
| `RpcException` / `RpcErrorHandler` / `RpcExceptionData` | `@nivinjoseph/n-web/client` | The error thrown by `RpcClient` on a non-2xx response, plus the optional global error-handler hook. |
| `Utils.generateUrl(route, params, baseUrl)` | `@nivinjoseph/n-web/client` | Builds a URL from a route template; `params` is type-checked against the route literal, and omitted/`null` optional params are dropped. Used internally by `RpcClient`; available directly too. |
| `ControllerRouteParams<typeof route>` | `@nivinjoseph/n-web/client` | Resolves a route template literal to its typed params object — `{ id: string }`, or `{ $search?: string \| null }` for optional query params. |
| `QueryControllerResponseBody<T>` / `CommandControllerRequestBody<T>` / `CommandControllerResponseBody<T>` | `@nivinjoseph/n-web/client` | Extract the response / request body types from a controller. These underpin the endpoint types; available directly too. |

> **Client vs. server entry point.** Everything above is exported from `@nivinjoseph/n-web/client` only — importing it never pulls in Koa, the DI container, `WebApp`, or your controllers, so a browser/client bundle stays small. The full `@nivinjoseph/n-web` entry point is for the server; the only export shared by both is `Utils` (the server uses it for link generation).

### Step 1 — define routes in one shared table

Put route templates in a single module that both the server (controllers) and clients (SDKs) import.

```typescript
// routes.ts
export class Routes {
    public static readonly query = {
        getUsers: "/api/users?{$search?: string}&{$pageNumber?: number}",
        getUser: "/api/users/{id: string}"
    } as const; // ⚠️ `as const` is required — see the note at the end of this section

    public static readonly command = {
        createUser: "/api/createUser"
    } as const;
}
```

### Step 2 — use the typed controller base classes

Controllers extend `QueryController<TResBody, TRoute>` or `CommandController<TReqBody, TResBody, TRoute>` (rather than the bare `Controller`), where `TRoute` is the route they serve — supplied as `typeof Routes...`. `TRoute` is **required**: every query/command controller must declare the route it serves. That does two things: it lets the endpoint types derive the route straight from the controller, and it makes `@route` **enforce** that the decorator's route matches.

```typescript
import { QueryController, CommandController, httpGet, httpPost, route } from "@nivinjoseph/n-web";
import { Routes } from "./routes.js";

@httpGet
@route(Routes.query.getUser)
export class GetUserController extends QueryController<UserModel, typeof Routes.query.getUser> {
    public override async execute(id: string): Promise<UserModel> { /* ... */ }
}

@httpPost
@route(Routes.command.createUser)
export class CreateUserController extends CommandController<CreateUserBody, UserModel, typeof Routes.command.createUser> {
    public override async execute(body: CreateUserBody): Promise<UserModel> { /* ... */ }
}
```

> **The decorator can't drift from the type.** If the `@route(...)` argument doesn't match the declared `TRoute`, it's a compile error that names both routes:
> ```typescript
> @route(Routes.command.deleteUser)   // ❌ Route drift: @route(/api/deleteUser) does not match
> export class GetUserController extends QueryController<UserModel, typeof Routes.query.getUser> { … }
> ```
> Because `TRoute` is required, a `QueryController<Res>` / `CommandController<Req, Res>` that omits it is a compile error — so the drift check and the single-generic endpoints below apply to every query/command controller, not just opted-in ones. Plain `Controller` subclasses (e.g. view controllers) carry no route type and accept any `@route`.

### Step 3 — derive the contract in one module

Create a contract module that derives one **endpoint type** per route from the controller that serves it — a single generic. Because the controller already declares its route (Step 2), the endpoint reads the route, its resolved params, the response body (and, for commands, the request body) straight off the controller; there is no route argument here that could drift. The controller imports are **type-only**, so they are erased at build time and add no runtime dependency.

```typescript
// sdk-contract.ts
import type { QueryEndpoint, CommandEndpoint } from "@nivinjoseph/n-web/client";
import type { GetUserController } from "./get-user-controller.js";
import type { CreateUserController } from "./create-user-controller.js";
import { Routes } from "./routes.js";

// re-export the route table so clients consume routes and types from one place
export { Routes };

// one endpoint contract per route, derived entirely from the controller that serves it
export type GetUserEndpoint = QueryEndpoint<GetUserController>;
export type CreateUserEndpoint = CommandEndpoint<CreateUserController>;

// granular aliases projected from the endpoints, for ergonomic method signatures
export type GetUserParams = GetUserEndpoint["params"];  // { id: string }
export type GetUserRes = GetUserEndpoint["res"];
export type CreateUserReq = CreateUserEndpoint["req"];
export type CreateUserRes = CreateUserEndpoint["res"];
```

### Step 4 — write the client SDK with `RpcClient`

`RpcClient` does the HTTP work — url generation from the route literal, base-url joining, JSON, timeouts, and error handling. Each `query`/`command` call is parameterized by a single endpoint type, so the route argument, the params, the request body, and the returned response are all validated together. The SDK is a thin, fully-typed wrapper:

```typescript
// user-sdk.ts
import { RpcClient } from "@nivinjoseph/n-web/client";
import {
    Routes,
    type GetUserEndpoint, type GetUserParams, type GetUserRes,
    type CreateUserEndpoint, type CreateUserReq, type CreateUserRes
} from "./sdk-contract.js";

export class UserSdk {
    private readonly _rpc: RpcClient;

    public constructor(baseUrl: string) {
        this._rpc = new RpcClient(baseUrl);
    }

    public getUser(params: GetUserParams): Promise<GetUserRes> {
        // a single endpoint generic ties the route, params, and response together
        return this._rpc.query<GetUserEndpoint>(Routes.query.getUser, params);
    }

    public createUser(body: CreateUserReq): Promise<CreateUserRes> {
        return this._rpc.command<CreateUserEndpoint>(Routes.command.createUser, body);
    }
}
```

> `RpcClient` also supports per-request headers (`setHeader`), a request timeout, and a global error handler (`registerErrorHandler`) that receives an `RpcException` carrying the HTTP status and error body on a non-2xx response. A route with no params takes no params argument; one with params requires it.

You don't even need the wrapper — the endpoint generic gives the same guarantees when calling `RpcClient` directly, and the compiler enforces the whole contract:

```typescript
const rpc = new RpcClient("https://api.example.com");

const user = await rpc.query<GetUserEndpoint>(Routes.query.getUser, { id: "u_123" }); // ✅ typed as GetUserRes
// @ts-expect-error 'id' is required
await rpc.query<GetUserEndpoint>(Routes.query.getUser);
// @ts-expect-error 'id' must be a string
await rpc.query<GetUserEndpoint>(Routes.query.getUser, { id: 123 });
// @ts-expect-error wrong route literal for this endpoint
await rpc.query<GetUserEndpoint>(Routes.command.createUser, { id: "u_123" });
```

### Why `as const` is required

TypeScript widens object and class properties to their base type — so without `as const`, `Routes.query.getUser` is inferred as plain `string`, which discards the literal route text that `ControllerRouteParams` parses. Adding `as const` pins each route to its exact string-literal type.

```typescript
public static readonly query = {
    getUser: "/api/users/{id: string}"
};            // typeof Routes.query.getUser === string  → ControllerRouteParams yields no checking

public static readonly query = {
    getUser: "/api/users/{id: string}"
} as const;   // typeof Routes.query.getUser === "/api/users/{id: string}"  → { id: string }
```

> Plain module-level constants — `export const getUser = "/api/users/{id: string}";` — keep their literal type automatically and do **not** need `as const`. The assertion is only needed for object/class members.

## Complete Example

A complete example demonstrating all features can be found in the test-app directory. The example includes:
- Multiple controller types
- Authentication and authorization
- WebSocket support
- Static file serving
- Error handling
- Dependency injection

## Contributing
Contributions are welcome! Please follow the existing code style and include tests for new features.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
