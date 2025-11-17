import { Controller } from "../controller.js";
import { query } from "../query.js";
import { route } from "../route.js";

@query
@route("/healthCheck")
export class HealthCheckController extends Controller
{
    public override async execute(): Promise<any>
    {
        return {};   
    }
}