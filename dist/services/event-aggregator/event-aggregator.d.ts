import { EventHandler } from "./event-handler";
export interface EventAggregator {
    subscribe(event: string, handler: EventHandler): void;
    publish(event: string, ...eventArgs: any[]): Promise<void>;
}
