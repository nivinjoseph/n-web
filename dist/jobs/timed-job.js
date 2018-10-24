"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const n_util_1 = require("@nivinjoseph/n-util");
class TimedJob {
    constructor(logger, intervalMilliseconds) {
        n_defensive_1.given(logger, "logger").ensureHasValue().ensureIsObject();
        this._logger = logger;
        n_defensive_1.given(intervalMilliseconds, "intervalMilliseconds").ensureHasValue().ensureIsNumber().ensure(t => t >= 0);
        this._intervalMilliseconds = intervalMilliseconds;
        this._backgroundProcessor = new n_util_1.BackgroundProcessor((e) => this._logger.logError(e), this._intervalMilliseconds, false);
        this._backgroundProcessor.processAction(() => this.run());
        this._backgroundProcessor.processAction(() => this.run());
        this._interval = setInterval(() => {
            if (this._backgroundProcessor.queueLength > 2)
                return;
            this._backgroundProcessor.processAction(() => this.run());
        }, this._intervalMilliseconds);
    }
    dispose() {
        clearInterval(this._interval);
        return this._backgroundProcessor.dispose();
    }
}
exports.TimedJob = TimedJob;
//# sourceMappingURL=timed-job.js.map