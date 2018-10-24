import { Logger } from "@nivinjoseph/n-log";
import { given } from "@nivinjoseph/n-defensive";
import { BackgroundProcessor } from "@nivinjoseph/n-util";
import { Job } from "./job";

// public
export abstract class TimedJob implements Job
{
    private readonly _logger: Logger;
    private readonly _intervalMilliseconds: number;
    private readonly _backgroundProcessor: BackgroundProcessor;
    private readonly _interval: any;


    public constructor(logger: Logger, intervalMilliseconds: number)
    {
        given(logger, "logger").ensureHasValue().ensureIsObject();
        this._logger = logger;

        given(intervalMilliseconds, "intervalMilliseconds").ensureHasValue().ensureIsNumber().ensure(t => t >= 0);
        this._intervalMilliseconds = intervalMilliseconds;

        this._backgroundProcessor = new BackgroundProcessor((e) => this._logger.logError(e as any), this._intervalMilliseconds, false);

        this._backgroundProcessor.processAction(() => this.run());
        this._backgroundProcessor.processAction(() => this.run());
        this._interval = setInterval(() =>
        {
            if (this._backgroundProcessor.queueLength > 2)
                return;
            
            this._backgroundProcessor.processAction(() => this.run());
        }, this._intervalMilliseconds);
    }


    public abstract run(): Promise<void>;

    public dispose(): Promise<void>
    {
        clearInterval(this._interval);
        return this._backgroundProcessor.dispose();
    }
}