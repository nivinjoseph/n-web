import { ApplicationException } from "n-exception";
import "n-ext";

export class TodoNotFoundException extends ApplicationException
{
    public constructor(id: number)
    {
        super("Todo with id '{0}' not found".format(id));
    }
}