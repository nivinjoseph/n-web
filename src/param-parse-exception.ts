import { ApplicationException } from "n-exception";

export class ParamParseException extends ApplicationException
{
    public constructor(message: string)
    {
        super(message);
    }
}