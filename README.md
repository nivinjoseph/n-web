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

A pure client also doesn't need the server framework, so n-web ships a lightweight entry point for it.

### The building blocks

| Export | From | Purpose |
| --- | --- | --- |
| `Utils.generateUrl(route, params, baseUrl)` | `@nivinjoseph/n-web/client` | Builds a URL from a route template. The `params` argument is **type-checked against the route literal**. Optional params that are omitted (or `null`/`undefined`) are dropped, producing a clean URL. |
| `ControllerRouteParams<typeof route>` | `@nivinjoseph/n-web/client` | Resolves a route template literal to its typed params object — e.g. `{ id: string }`, or `{ $search?: string \| null }` for optional query params. |
| `QueryControllerResponseBody<T>` | `@nivinjoseph/n-web/client` | Extracts the response body type from a `QueryController` subclass. |
| `CommandControllerRequestBody<T>` / `CommandControllerResponseBody<T>` | `@nivinjoseph/n-web/client` | Extract the request / response body types from a `CommandController` subclass. |

> **Client vs. server entry point.** `@nivinjoseph/n-web/client` exposes only `Utils` plus the contract types above. Importing it never pulls in Koa, the DI container, `WebApp`, or your controllers — so a browser/client bundle stays small. Use the full `@nivinjoseph/n-web` entry point only on the server.

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

For the contract types to be extractable, controllers must extend `QueryController<TResBody>` or `CommandController<TReqBody, TResBody>` (rather than the bare `Controller`), and reference the shared routes:

```typescript
import { QueryController, CommandController, httpGet, httpPost, route } from "@nivinjoseph/n-web";
import { Routes } from "./routes.js";

@httpGet
@route(Routes.query.getUser)
export class GetUserController extends QueryController<UserModel> {
    public override async execute(id: string): Promise<UserModel> { /* ... */ }
}

@httpPost
@route(Routes.command.createUser)
export class CreateUserController extends CommandController<CreateUserBody, UserModel> {
    public override async execute(body: CreateUserBody): Promise<UserModel> { /* ... */ }
}
```

### Step 3 — derive the contract in one module

Create a contract module that derives every client-facing type from the controllers and the routes. The controller imports are **type-only**, so they are erased at build time and add no runtime dependency.

```typescript
// sdk-contract.ts
import type {
    ControllerRouteParams,
    QueryControllerResponseBody,
    CommandControllerRequestBody,
    CommandControllerResponseBody
} from "@nivinjoseph/n-web/client";
import type { GetUserController } from "./get-user-controller.js";
import type { CreateUserController } from "./create-user-controller.js";
import { Routes } from "./routes.js";

// re-export the route table so clients consume routes and types from one place
export { Routes };

// response/request bodies, pulled straight from the controllers
export type GetUserRes = QueryControllerResponseBody<GetUserController>;
export type CreateUserReq = CommandControllerRequestBody<CreateUserController>;
export type CreateUserRes = CommandControllerResponseBody<CreateUserController>;

// request params, pulled straight from the route literals
export type GetUserParams = ControllerRouteParams<typeof Routes.query.getUser>;   // { id: string }
export type GetUsersParams = ControllerRouteParams<typeof Routes.query.getUsers>; // { $search?: string | null; $pageNumber?: number | null }
```

### Step 4 — write the client SDK

The SDK is a pure client: it imports `Utils` from the `/client` entry point and the derived types from the contract module. It never references controllers or the server framework.

```typescript
// user-sdk.ts
import { Utils } from "@nivinjoseph/n-web/client";
import {
    Routes,
    type GetUserParams, type GetUserRes,
    type CreateUserReq, type CreateUserRes
} from "./sdk-contract.js";

export class UserSdk {
    public constructor(private readonly _baseUrl: string) { }

    public async getUser(params: GetUserParams): Promise<GetUserRes> {
        // params is typed `{ id: string }` straight from the route
        const url = Utils.generateUrl(Routes.query.getUser, params, this._baseUrl);
        return this._get<GetUserRes>(url);
    }

    public async createUser(body: CreateUserReq): Promise<CreateUserRes> {
        const url = Utils.generateUrl(Routes.command.createUser, undefined, this._baseUrl);
        return this._post<CreateUserRes>(url, body);
    }

    private async _get<T>(url: string): Promise<T> {
        const res = await fetch(url, { method: "GET", headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`GET ${url} failed with status ${res.status}.`);
        return await res.json() as T;
    }

    private async _post<T>(url: string, body: unknown): Promise<T> {
        const res = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json", "accept": "application/json" },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`POST ${url} failed with status ${res.status}.`);
        return await res.json() as T;
    }
}
```

Now the contract is enforced by the compiler:

```typescript
const sdk = new UserSdk("https://api.example.com");

await sdk.getUser({ id: "u_123" });   // ✅
await sdk.getUser({});                 // ❌ compile error: 'id' is required
await sdk.getUser({ id: 123 });        // ❌ compile error: 'id' must be a string
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
