import { EventAggregator } from "./event-aggregator";
import { EventHandler } from "./event-handler";
export declare class DefaultEventAggregator implements EventAggregator {
    private _subscriptions;
    publish(event: string, ...eventArgs: any[]): Promise<void>;
    subscribe(event: string, handler: EventHandler): void;
}
