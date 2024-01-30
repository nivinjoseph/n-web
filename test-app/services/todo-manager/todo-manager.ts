import { Todo } from "./../../models/todo.js";

export interface TodoManager
{
    getTodos(): Promise<Array<Todo>>;
    addTodo(title: string, description: string): Promise<Todo>;
    updateTodo(id: number, title: string, description: string): Promise<Todo>;
    deleteTodo(id: number): Promise<void>;
}