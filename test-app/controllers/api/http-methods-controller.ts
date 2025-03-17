import { Controller, httpGet, httpPost, route } from "../../../src/index.js";



@httpGet
@route("/location/{id?: string}/{name: string}?{optional?: string}&{required: string}")
export class GetController extends Controller
{
    public override async execute(id: string | null, name: string, optional: string | null, required: string): Promise<any>
    {
        console.log({ id });
        console.log({ name });
        console.log({ optional });
        console.log({ required });

        return [
            {
                hello: "world"
            }
        ];
    }
}


@httpPost
@route("/locations/{filter?:string}/asd/{asd:number}")
export class PostController extends Controller
{
    public override async execute(filter: string | null, asd: string, model: { hello: string; }): Promise<any>
    {
        console.log({ filter });
        console.log({ asd });
        console.log(model);

        return model;
    }
}