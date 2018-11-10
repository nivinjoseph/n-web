import * as Assert from "assert";
import { Schedule } from "../src/jobs/schedule";
import * as moment from "moment";


suite.only("Schedule", () => {

    suite("Single config", () =>
    {
        test("given schedule has no config, when the reference is 2018-11-09 22:28, then calculated time should be 2018-11-09 22:29", () =>
        {
            const schedule = new Schedule("test");
            const reference = moment("2018-11-09 22:28").valueOf();
            const expected = moment("2018-11-09 22:29").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config minute = 1, when the reference is 2018-11-09 22:28, then time should be 2018-11-09 23:01", () =>
        {
            const schedule = new Schedule("test");
            schedule.setMinute(1);
            const reference = moment("2018-11-09 22:28").valueOf();
            const expected = moment("2018-11-09 23:01").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config hour = 23, when the reference is 2018-11-09 22:28, then time should be 2018-11-09 23:00", () =>
        {
            const schedule = new Schedule("test");
            schedule.setHour(23);
            const reference = moment("2018-11-09 22:28").valueOf();
            const expected = moment("2018-11-09 23:00").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });


        test("given schedule has config hour = 23, when the reference is 2018-11-09 23:50, then time should be 2018-11-09 23:51", () =>
        {
            const schedule = new Schedule("test");
            schedule.setHour(23);
            const reference = moment("2018-11-09 23:50").valueOf();
            const expected = moment("2018-11-09 23:51").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config hour = 23, when the reference is 2018-11-09 23:59, then time should be 2018-11-10 23:00", () =>
        {
            const schedule = new Schedule("test");
            schedule.setHour(23);
            const reference = moment("2018-11-09 23:59").valueOf();
            const expected = moment("2018-11-10 23:00").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config dayOfWeek = 5, when the reference is 2018-11-12 23:50, then time should be 2018-11-16 00:00", () =>
        {
            const schedule = new Schedule("test");
            schedule.setDayOfWeek(5);
            const reference = moment("2018-11-12 23:50").valueOf();
            const expected = moment("2018-11-16 00:00").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config dayOfWeek = 1, when the reference is 2018-11-12 23:50, then time should be 2018-11-12 23:51", () =>
        {
            const schedule = new Schedule("test");
            schedule.setDayOfWeek(1);
            const reference = moment("2018-11-12 23:50").valueOf();
            const expected = moment("2018-11-12 23:51").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config dayOfWeek = 1, when the reference is 2018-11-12 23:59, then time should be 2018-11-19 00:00", () =>
        {
            const schedule = new Schedule("test");
            schedule.setDayOfWeek(1);
            const reference = moment("2018-11-12 23:59").valueOf();
            const expected = moment("2018-11-19 00:00").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config dayOfMonth = 1, when the reference is 2018-11-12 23:50, then time should be 2018-12-01 00:00", () =>
        {
            const schedule = new Schedule("test");
            schedule.setDayOfMonth(1);
            const reference = moment("2018-11-12 23:50").valueOf();
            const expected = moment("2018-12-01 00:00").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });


        test("given schedule has config dayOfMonth = 12, when the reference is 2018-11-12 23:50, then time should be 2018-11-12 23:51", () =>
        {
            const schedule = new Schedule("test");
            schedule.setDayOfMonth(12);
            const reference = moment("2018-11-12 23:50").valueOf();
            const expected = moment("2018-11-12 23:51").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config dayOfMonth = 12, when the reference is 2018-11-12 23:59, then time should be 2018-12-12 00:00", () =>
        {
            const schedule = new Schedule("test");
            schedule.setDayOfMonth(12);
            const reference = moment("2018-11-12 23:59").valueOf();
            const expected = moment("2018-12-12 00:00").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config month = 11, when the reference is 2018-11-12 23:59, then time should be 2018-12-01 00:00", () =>
        {
            const schedule = new Schedule("test");
            schedule.setMonth(11);
            const reference = moment("2018-11-12 23:59").valueOf();
            const expected = moment("2018-12-01 00:00").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config month = 10, when the reference is 2018-11-12 23:59, then time should be 2018-11-12 24:00", () =>
        {
            const schedule = new Schedule("test");
            schedule.setMonth(10);
            const reference = moment("2018-11-12 23:59").valueOf();
            const expected = moment("2018-11-12 24:00").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config month = 10, when the reference is 2018-11-30 23:59, then time should be 2019-11-01 00:00", () =>
        {
            const schedule = new Schedule("test");
            schedule.setMonth(10);
            const reference = moment("2018-11-30 23:59").valueOf();
            const expected = moment("2019-11-01 00:00").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });
    });

    suite("Multiple config", () =>
    {
        test("given schedule has config hour = 12 min = 12, when the reference is 2018-11-30 01:59, then time should be 2018-11-30 12:12", () =>
        {
            const schedule = new Schedule("test");
            schedule.setHour(12);
            schedule.setMinute(12);
            const reference = moment("2018-11-30 01:59").valueOf();
            const expected = moment("2018-11-30 12:12").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config hour = 12 min = 12, when the reference is 2018-11-30 12:12, then time should be 2018-12-01 12:12", () =>
        {
            const schedule = new Schedule("test");
            schedule.setHour(12);
            schedule.setMinute(12);
            const reference = moment("2018-11-30 12:12").valueOf();
            const expected = moment("2018-12-01 12:12").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config dayOfMonth = 12 month = 1, when the reference is 2018-11-30 12:12, then time should be 2019-02-12 00:00", () =>
        {
            const schedule = new Schedule("test");
            schedule.setDayOfMonth(12);
            schedule.setMonth(1);
            const reference = moment("2018-11-30 12:12").valueOf();
            const expected = moment("2019-02-12 00:00").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config dayOfMonth = 14 hour = 12 min = 12, when the reference is 2018-11-30 12:12, then time should be 2018-12-14 12:12", () =>
        {
            const schedule = new Schedule("test");
            schedule.setHour(12);
            schedule.setMinute(12);
            schedule.setDayOfMonth(14);
            const reference = moment("2018-11-30 12:12").valueOf();
            const expected = moment("2018-12-14 12:12").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config dayOfWeek = 6 hour = 12 min = 12, when the reference is 2018-11-13 12:12, then time should be 2018-11-17 12:12", () =>
        {
            const schedule = new Schedule("test");
            schedule.setHour(12);
            schedule.setMinute(12);
            schedule.setDayOfWeek(6);
            const reference = moment("2018-11-13 12:12").valueOf();
            const expected = moment("2018-11-17 12:12").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config month = 0 dayOfMonth = 6 hour = 12 min = 12, when the reference is 2018-11-13 12:12, then time should be 2019-01-06 12:12", () =>
        {
            const schedule = new Schedule("test");
            schedule.setHour(12);
            schedule.setMinute(12);
            schedule.setDayOfMonth(6);
            schedule.setMonth(0);
            const reference = moment("2018-11-13 12:12").valueOf();
            const expected = moment("2019-01-06 12:12").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });

        test("given schedule has config month = 0 dayOfMonth = 1 hour = 0 min = 0, when the reference is 2019-01-01 00:00, then time should be 2020-01-01 00:00", () =>
        {
            const schedule = new Schedule("test");
            schedule.setHour(0);
            schedule.setMinute(0);
            schedule.setDayOfMonth(1);
            schedule.setMonth(0);
            const reference = moment("2019-01-01 00:00").valueOf();
            const expected = moment("2020-01-01 00:00").valueOf();
            const next = schedule.calculateNext(reference);
            Assert.strictEqual(next, expected);
        });
    });
});