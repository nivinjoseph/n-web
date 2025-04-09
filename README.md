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
5. [Complete Example](#complete-example)

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
[Add appropriate license information]
