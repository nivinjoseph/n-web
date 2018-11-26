export declare abstract class EventHandler<TEvent> {
    abstract handle(event: TEvent): Promise<void>;
}
