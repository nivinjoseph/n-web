import { EventBus } from "./event-bus";
import { EventHandler } from "./event-handler";
import { BackgroundProcessor } from "@nivinjoseph/n-util";
export declare class DefaultEventBus implements EventBus {
    private readonly _subscriptions;
    private _processor;
    useProcessor(processor: BackgroundProcessor): void;
    publish(event: object): Promise<void>;
    subscribe(eventTypeName: string, handler: EventHandler<any>): void;
}
