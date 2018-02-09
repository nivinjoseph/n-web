import { ApplicationException } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";

export class TodoNotFoundException extends ApplicationException
{
    public constructor(id: number)
    {
        super("Todo with id '{0}' not found".format(id));
    }
}