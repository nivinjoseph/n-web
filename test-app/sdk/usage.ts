import { type CreateTodoReq, TodoSdk } from "./todo-sdk.js";

// Demonstrates that the extracted request/response types carry full shape information.
// Each property access below only type-checks because the utility types correctly recovered
// TResBody / TReqBody from the controller classes.
export async function demo(): Promise<void>
{
    const sdk = new TodoSdk("http://localhost:8080");

    // getTodos returns a collection of live, observable TodoProxy objects (each fully loaded).
    // params are typed from the route: { $search?; $pageNumber?; $pageSize? }
    const todos = await sdk.getTodos({ $search: "groceries" });
    for (const t of todos)
        console.log(t.id, t.title, t.links.self);

    // getTodo returns a live, observable TodoProxy (not a raw DTO). Its `computed` getters project
    // the backing DTO: { id; title; description; links: { self; update; delete } }
    // params are typed from the route: { id: number }
    const todo = await sdk.getTodo({ id: 1 });
    console.log(todo.id, todo.title, todo.description, todo.links.update, todo.links.delete);

    // snapshot helpers inherited from ProxyBase
    const fullClone = todo.cloneValue();              // deep clone of the whole DTO, in DTO shape
    const partial = todo.copyValue("title", "links"); // deep clone of named proxy props, in proxy shape
    console.log(fullClone.description, partial.title, partial.links.self);

    // re-fetch by id and swap the DTO in — the computed getters re-evaluate against the new value
    await todo.refresh();
    console.log(todo.title);

    // CreateTodoBody -> { title; description }  (extracted TReqBody)
    const newTodo: CreateTodoReq = { title: "buy milk", description: "2%" };
    const created = await sdk.createTodo(newTodo);
    console.log(created.id, created.links.self);
}
