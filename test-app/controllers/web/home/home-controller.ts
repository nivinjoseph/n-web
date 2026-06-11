import { httpGet, route, Controller, view } from "./../../../../src/index.js";
import {Routes} from "./../../routes.js";

@httpGet
@route(Routes.ui.home)    
@view("home-view")    
export class HomeController extends Controller
{
    public execute(): Promise<any>
    {
        return Promise.resolve({ message: "Hello from home" });
    }
}