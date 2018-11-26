import { EventHandler } from "./event-handler";

// public
export interface EventAggregator
{
    subscribe(event: string, handler: EventHandler<any>): void;
    publish(event: object): Promise<void>;   
}