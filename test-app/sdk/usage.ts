import { type CreateTodoReq, TodoSdk } from "./todo-sdk.js";

// Demonstrates that the extracted request/response types carry full shape information.
// Each property access below only type-checks because the utility types correctly recovered
// TResBody / TReqBody from the controller classes.
export async function demo(): Promise<void>
{
    const sdk = new TodoSdk("http://localhost:8080");

    // GetTodosResult -> { items: Array<{ id; title; links: { self } }>; links: { create; test } }
    const list = await sdk.getTodos("groceries");
    for (const item of list.items)
        console.log(item.id, item.title, item.links.self);
    console.log(list.links.create, list.links.test);

    // GetTodoResult -> { id; title; description; links: { self; update; delete } }
    const todo = await sdk.getTodo(1);
    console.log(todo.id, todo.title, todo.description, todo.links.update, todo.links.delete);

    // CreateTodoBody -> { title; description }  (extracted TReqBody)
    const newTodo: CreateTodoReq = { title: "buy milk", description: "2%" };
    const created = await sdk.createTodo(newTodo);
    console.log(created.id, created.links.self);
}
