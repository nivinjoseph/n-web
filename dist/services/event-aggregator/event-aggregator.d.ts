export interface EventAggregator {
    publish(event: string, ...eventArgs: any[]): Promise<void>;
}
