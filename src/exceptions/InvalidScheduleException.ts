import { Exception } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";

export class InvalidScheduleException extends Exception
{

    public constructor(message: string)
    {
        super(message);
    }
}

