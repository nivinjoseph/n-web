export declare class Schedule {
    private readonly _timeZone;
    private _minute;
    private _hour;
    private _dayOfWeek;
    private _dayOfMonth;
    private _month;
    readonly minute: number;
    readonly hour: number;
    readonly dayOfWeek: number;
    readonly dayOfMonth: number;
    readonly month: number;
    readonly timeZone: string;
    setTimeZone(value: string): this;
    setMinute(value: number): this;
    setHour(value: number): this;
    setDayOfWeek(value: number): this;
    setDayOfMonth(value: number): this;
    setMonth(value: number): this;
    calculateNext(referenceDateTime: number): number;
    private validateDayOfMonthAndMonth;
}
