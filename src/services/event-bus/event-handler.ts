// public
export abstract class EventHandler<TEvent>
{
    public abstract handle(event: TEvent): Promise<void>;
}