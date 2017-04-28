import { httpGet, route, Controller, view, viewLayout } from "./../../../../src/index";
import * as routes from "./../../routes";

@httpGet
@route(routes.homeWithLayout)
@view("home-with-layout-view")
@viewLayout("layout")    
export class HomeWithLayoutController extends Controller
{
    public execute(): Promise<any>
    {
        return Promise.resolve({ part1: "Hello from home", part2: "with layout" });
    }
}