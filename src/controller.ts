// public
export abstract class Controller
{
    public abstract execute(...params: any[]): Promise<any>;
}