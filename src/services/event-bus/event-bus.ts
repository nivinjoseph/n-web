// public
export interface EventBus
{
    publish(event: object): Promise<void>;   
}