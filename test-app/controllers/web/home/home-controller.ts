import { httpGet, route, Controller, view } from "./../../../../src/index.js";
import * as routes from "./../../routes.js";

@httpGet
@route(routes.home)    
@view("home-view")    
export class HomeController extends Controller
{
    public execute(): Promise<any>
    {
        return Promise.resolve({ message: "Hello from home" });
    }
}