import { Exception } from "@nivinjoseph/n-exception";

export abstract class ExceptionHandler
{
    public abstract handle(exp: Exception): Promise<any>;
}