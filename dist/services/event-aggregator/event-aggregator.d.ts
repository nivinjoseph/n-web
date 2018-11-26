import { EventHandler } from "./event-handler";
export interface EventAggregator {
    subscribe(event: string, handler: EventHandler<any>): void;
    publish(event: object): Promise<void>;
}
