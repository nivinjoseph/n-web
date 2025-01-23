import { Controller, httpGet, route, view } from "./../../../../src/index.js";

@httpGet
@route("/*")
@view("not-found-view")
export class NotFoundController extends Controller
{
    public execute(): Promise<any>
    {
        return Promise.resolve({ message: "Hello from home" });
    }
}