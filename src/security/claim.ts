import { given } from "n-defensive";
import "n-ext";


// public
export class Claim
{
    private readonly _type: string;
    private readonly _value: any;


    public get type(): string { return this._type; }
    public get value(): any { return this._value; }


    public constructor(type: string, value: any)
    {
        given(type, "type").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());

        this._type = type.trim();
        this._value = value;
    }
}