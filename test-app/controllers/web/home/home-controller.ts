import { httpGet, route, Controller, view } from "./../../../../src/index";
import * as routes from "./../../routes";

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