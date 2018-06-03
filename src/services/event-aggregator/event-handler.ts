// public
export abstract class EventHandler // concrete name pattern => [EventName]Event[Action]Handler, eg. UserCreatedEventSendActivationEmailHandler
{
    public abstract handle(...params: any[]): Promise<void>;
}