import { EventAggregator } from "./event-aggregator";
import { EventHandler } from "./event-handler";
import { BackgroundProcessor } from "@nivinjoseph/n-util";
export declare class DefaultEventAggregator implements EventAggregator {
    private readonly _subscriptions;
    private _processor;
    useProcessor(processor: BackgroundProcessor): void;
    subscribe(event: string, handler: EventHandler): void;
    publish(event: string, ...eventArgs: any[]): Promise<void>;
}
