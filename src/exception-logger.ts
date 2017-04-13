import { Exception } from "n-exception";

export abstract class ExceptionLogger
{
    public abstract log(exp: Exception): Promise<void>;
}