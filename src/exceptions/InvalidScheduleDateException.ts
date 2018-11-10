import { Exception } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";

export class InvalidScheduleDateException extends Exception
{

    public constructor()
    {
        super("Invalid schedule date provided.");
    }
}

