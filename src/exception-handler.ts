import { Exception } from "n-exception";

export abstract class ExceptionHandler
{
    public abstract handle(exp: Exception): Promise<any>;
}