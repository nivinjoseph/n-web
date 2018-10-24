// import { given } from "@nivinjoseph/n-defensive";


// export class Schedule
// {
//     private readonly _timeZone: string;
//     private _minute: number = null;
//     private _hour: number = null;
//     private _dayOfWeek: number = null;
//     private _dayOfMonth: number = null;
//     private _month: number = null;


//     public constructor(timeZone: string)
//     {
//         given(timeZone, "timeZone").ensureHasValue().ensureIsString();
//         this._timeZone = timeZone;
//     }


//     // 0-59
//     public minute(value: number): this
//     {
//         given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0 && t <= 59);
//         this._minute = value;
//         return this;
//     }
//     // 0-23
//     public hour(value: number): this
//     {
//         given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0 && t <= 23);
//         this._hour = value;
//         return this;
//     }
//     // 0-6
//     public dayOfWeek(value: number): this
//     {
//         given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0 && t <= 6);
//         this._dayOfWeek = value;
//         return this;
//     }
//     // 0-30
//     public dayOfMonth(value: number): this
//     {
//         given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0 && t <= 30);
//         this._dayOfMonth = value;
//         return this;
//     }
//     // 0-11
//     public month(value: number): this
//     {
//         given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0 && t <= 11);
//         this._month = value;
//         return this;
//     }

//     public calculateNext(): number
//     {

//     }


//     private calculateMinute(): number
//     {
        
//     }

//     private calculateHour(): number
//     {

//     }

//     private calculateDay(): number
//     {

//     }

//     private calculateMonth(): number
//     {

//     }
// }