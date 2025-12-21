import {
  RecurrenceFrequency,
  RecurrenceRule,
  Weekday,
  Month,
} from "../enums/event.enum";
import { RRule, Frequency } from "rrule";

/**
 * Builds an iCalendar RRULE string from RecurrenceRule interface
 *
 * @param rule - Structured recurrence rule object
 * @returns iCalendar RRULE string (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR")
 * @throws Error if rule is invalid (e.g., both count and until specified)
 *
 * @example
 * buildRRule({ freq: RecurrenceFrequency.DAILY })
 * // => "FREQ=DAILY"
 *
 * @example
 * buildRRule({
 *   freq: RecurrenceFrequency.WEEKLY,
 *   interval: 2,
 *   byDay: [Weekday.MONDAY, Weekday.WEDNESDAY]
 * })
 * // => "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE"
 */
export function buildRRule(rule: RecurrenceRule): string {
  // Validation: until is required
  if (!rule.until) {
    throw new Error("RRULE must have UNTIL");
  }

  const parts: string[] = [`FREQ=${rule.freq}`];

  if (rule.interval !== undefined && rule.interval > 1) {
    parts.push(`INTERVAL=${rule.interval}`);
  }

  // Format: YYYYMMDDTHHMMSSZ (UTC)
  const utcDate = new Date(rule.until);
  const formatted = utcDate
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  parts.push(`UNTIL=${formatted}`);


  if (rule.byDay && rule.byDay.length > 0) {
    parts.push(`BYDAY=${rule.byDay.join(",")}`);
  }

  if (rule.byMonthDay && rule.byMonthDay.length > 0) {
    parts.push(`BYMONTHDAY=${rule.byMonthDay.join(",")}`);
  }

  if (rule.byMonth && rule.byMonth.length > 0) {
    parts.push(`BYMONTH=${rule.byMonth.join(",")}`);
  }

  if (rule.bySetPos && rule.bySetPos.length > 0) {
    parts.push(`BYSETPOS=${rule.bySetPos.join(",")}`);
  }

  if (rule.byWeekNo && rule.byWeekNo.length > 0) {
    parts.push(`BYWEEKNO=${rule.byWeekNo.join(",")}`);
  }

  if (rule.byYearDay && rule.byYearDay.length > 0) {
    parts.push(`BYYEARDAY=${rule.byYearDay.join(",")}`);
  }

  if (rule.byHour && rule.byHour.length > 0) {
    parts.push(`BYHOUR=${rule.byHour.join(",")}`);
  }

  if (rule.byMinute && rule.byMinute.length > 0) {
    parts.push(`BYMINUTE=${rule.byMinute.join(",")}`);
  }

  if (rule.bySecond && rule.bySecond.length > 0) {
    parts.push(`BYSECOND=${rule.bySecond.join(",")}`);
  }

  if (rule.wkst) {
    parts.push(`WKST=${rule.wkst}`);
  }

  return parts.join(";");
}

/**
 * Parses an iCalendar RRULE string into RecurrenceRule interface
 *
 * @param rruleString - iCalendar RRULE string
 * @returns Structured RecurrenceRule object
 * @throws Error if RRULE string is invalid or missing FREQ
 *
 * @example
 * parseRRule("FREQ=DAILY")
 * // => { freq: RecurrenceFrequency.DAILY }
 *
 * @example
 * parseRRule("FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR;UNTIL=20261231T235959Z")
 * // => { freq: RecurrenceFrequency.WEEKLY, interval: 2, byDay: ["MO", "WE", "FR"], until: Date(...) }
 */
export function parseRRule(rruleString: string): RecurrenceRule {
  const parts = rruleString.split(";");
  const rule: Partial<RecurrenceRule> = {};

  for (const part of parts) {
    const [key, value] = part.split("=");

    switch (key) {
      case "FREQ":
        if (!Object.values(RecurrenceFrequency).includes(value as RecurrenceFrequency)) {
          throw new Error(`Invalid FREQ value: ${value}`);
        }
        rule.freq = value as RecurrenceFrequency;
        break;

      case "INTERVAL":
        rule.interval = parseInt(value, 10);
        break;

      case "COUNT":
        throw new Error("COUNT is not supported. Use UNTIL instead.");
        break;

      case "UNTIL":
        // Parse YYYYMMDDTHHMMSSZ format
        const year = parseInt(value.substring(0, 4), 10);
        const month = parseInt(value.substring(4, 6), 10) - 1;
        const day = parseInt(value.substring(6, 8), 10);
        const hour = parseInt(value.substring(9, 11), 10) || 0;
        const minute = parseInt(value.substring(11, 13), 10) || 0;
        const second = parseInt(value.substring(13, 15), 10) || 0;
        rule.until = new Date(Date.UTC(year, month, day, hour, minute, second));
        break;

      case "BYDAY":
        rule.byDay = value.split(",");
        break;

      case "BYMONTHDAY":
        rule.byMonthDay = value.split(",").map((v) => parseInt(v, 10));
        break;

      case "BYMONTH":
        rule.byMonth = value.split(",").map((v) => parseInt(v, 10) as Month);
        break;

      case "BYSETPOS":
        rule.bySetPos = value.split(",").map((v) => parseInt(v, 10));
        break;

      case "BYWEEKNO":
        rule.byWeekNo = value.split(",").map((v) => parseInt(v, 10));
        break;

      case "BYYEARDAY":
        rule.byYearDay = value.split(",").map((v) => parseInt(v, 10));
        break;

      case "BYHOUR":
        rule.byHour = value.split(",").map((v) => parseInt(v, 10));
        break;

      case "BYMINUTE":
        rule.byMinute = value.split(",").map((v) => parseInt(v, 10));
        break;

      case "BYSECOND":
        rule.bySecond = value.split(",").map((v) => parseInt(v, 10));
        break;

      case "WKST":
        rule.wkst = value as Weekday;
        break;
    }
  }

  if (!rule.freq) {
    throw new Error("RRULE must contain FREQ");
  }

  if (!rule.until) {
    throw new Error("RRULE must contain UNTIL");
  }

  return rule as RecurrenceRule;
}

/**
 * Validates a RecurrenceRule object
 *
 * @param rule - RecurrenceRule to validate
 * @returns true if valid
 * @throws Error with validation message if invalid
 */
export function validateRRule(rule: RecurrenceRule): boolean {
  // FREQ is required
  if (!rule.freq) {
    throw new Error("FREQ is required in recurrence rule");
  }

  // UNTIL is required
  if (!rule.until) {
    throw new Error("UNTIL is required in recurrence rule");
  }

  // Interval must be positive
  if (rule.interval !== undefined && rule.interval < 1) {
    throw new Error("INTERVAL must be >= 1");
  }

  // UNTIL must be in the future
  if (rule.until < new Date()) {
    throw new Error("UNTIL must be in the future");
  }

  return true;
}

/**
 * Common recurrence patterns for easy use
 * Note: All patterns require an 'until' date parameter
 */
export const CommonRecurrencePatterns = {
  daily: (until: Date): RecurrenceRule => ({
    freq: RecurrenceFrequency.DAILY,
    until,
  }),

  weekdays: (until: Date): RecurrenceRule => ({
    freq: RecurrenceFrequency.WEEKLY,
    byDay: [
      Weekday.MONDAY,
      Weekday.TUESDAY,
      Weekday.WEDNESDAY,
      Weekday.THURSDAY,
      Weekday.FRIDAY,
    ],
    until,
  }),

  weekends: (until: Date): RecurrenceRule => ({
    freq: RecurrenceFrequency.WEEKLY,
    byDay: [Weekday.SATURDAY, Weekday.SUNDAY],
    until,
  }),

  weekly: (days: Weekday[], until: Date): RecurrenceRule => ({
    freq: RecurrenceFrequency.WEEKLY,
    byDay: days,
    until,
  }),

  biweekly: (days: Weekday[], until: Date): RecurrenceRule => ({
    freq: RecurrenceFrequency.WEEKLY,
    interval: 2,
    byDay: days,
    until,
  }),

  monthly: (dayOfMonth: number, until: Date): RecurrenceRule => ({
    freq: RecurrenceFrequency.MONTHLY,
    byMonthDay: [dayOfMonth],
    until,
  }),

  monthlyLastDay: (until: Date): RecurrenceRule => ({
    freq: RecurrenceFrequency.MONTHLY,
    byMonthDay: [-1],
    until,
  }),

  monthlyFirstWeekday: (weekday: Weekday, until: Date): RecurrenceRule => ({
    freq: RecurrenceFrequency.MONTHLY,
    byDay: [`1${weekday}`],
    until,
  }),

  monthlyLastWeekday: (weekday: Weekday, until: Date): RecurrenceRule => ({
    freq: RecurrenceFrequency.MONTHLY,
    byDay: [`-1${weekday}`],
    until,
  }),

  yearly: (month: Month, day: number, until: Date): RecurrenceRule => ({
    freq: RecurrenceFrequency.YEARLY,
    byMonth: [month],
    byMonthDay: [day],
    until,
  }),
};

/**
 * Helper to map RecurrenceFrequency to RRule Frequency
 */
function mapFrequencyToRRule(freq: RecurrenceFrequency): Frequency {
  const mapping: Record<RecurrenceFrequency, Frequency> = {
    [RecurrenceFrequency.YEARLY]: RRule.YEARLY,
    [RecurrenceFrequency.MONTHLY]: RRule.MONTHLY,
    [RecurrenceFrequency.WEEKLY]: RRule.WEEKLY,
    [RecurrenceFrequency.DAILY]: RRule.DAILY,
    [RecurrenceFrequency.HOURLY]: RRule.HOURLY,
    [RecurrenceFrequency.MINUTELY]: RRule.MINUTELY,
    [RecurrenceFrequency.SECONDLY]: RRule.SECONDLY,
  };
  return mapping[freq];
}

/**
 * Helper to map Weekday to RRule weekday constants
 */
function mapWeekdayToRRule(weekday: string): number {
  const mapping: Record<string, number> = {
    SU: RRule.SU.weekday,
    MO: RRule.MO.weekday,
    TU: RRule.TU.weekday,
    WE: RRule.WE.weekday,
    TH: RRule.TH.weekday,
    FR: RRule.FR.weekday,
    SA: RRule.SA.weekday,
  };
  return mapping[weekday];
}

/**
 * Generate event date instances from a recurrence rule
 *
 * @param startDate - The start date/time of the first event
 * @param duration - Duration of each event in milliseconds
 * @param recurrenceRule - The recurrence rule to apply
 * @returns Array of { start, end } dates for each event instance
 *
 * @example
 * const instances = generateRecurringEventInstances(
 *   new Date("2025-01-01T10:00:00Z"),
 *   60 * 60 * 1000, // 1 hour
 *   { freq: RecurrenceFrequency.WEEKLY, byDay: [Weekday.MONDAY], until: new Date("2025-12-31") }
 * );
 */
export function generateRecurringEventInstances(
  startDate: Date,
  duration: number,
  recurrenceRule: RecurrenceRule
): Array<{ start: Date; end: Date }> {
  // Convert RecurrenceRule to RRule options
  const rruleOptions: any = {
    freq: mapFrequencyToRRule(recurrenceRule.freq),
    dtstart: startDate,
    until: recurrenceRule.until,
  };

  if (recurrenceRule.interval) {
    rruleOptions.interval = recurrenceRule.interval;
  }

  if (recurrenceRule.byDay) {
    // Handle byDay with position (e.g., "1MO", "-1FR")
    rruleOptions.byweekday = recurrenceRule.byDay.map((day) => {
      if (typeof day === "string") {
        // Check if it has a position prefix (e.g., "1MO", "-1FR")
        const match = day.match(/^(-?\d+)?([A-Z]{2})$/);
        if (match) {
          const position = match[1] ? parseInt(match[1]) : null;
          const weekdayCode = match[2];
          const weekdayNum = mapWeekdayToRRule(weekdayCode);

          if (position !== null) {
            // With position: use RRule weekday with nth
            const rruleWeekdays = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];
            return rruleWeekdays[weekdayNum].nth(position);
          } else {
            return weekdayNum;
          }
        }
      }
      return mapWeekdayToRRule(day);
    });
  }

  if (recurrenceRule.byMonthDay) {
    rruleOptions.bymonthday = recurrenceRule.byMonthDay;
  }

  if (recurrenceRule.byMonth) {
    rruleOptions.bymonth = recurrenceRule.byMonth;
  }

  if (recurrenceRule.bySetPos) {
    rruleOptions.bysetpos = recurrenceRule.bySetPos;
  }

  if (recurrenceRule.byWeekNo) {
    rruleOptions.byweekno = recurrenceRule.byWeekNo;
  }

  if (recurrenceRule.byYearDay) {
    rruleOptions.byyearday = recurrenceRule.byYearDay;
  }

  if (recurrenceRule.byHour) {
    rruleOptions.byhour = recurrenceRule.byHour;
  }

  if (recurrenceRule.byMinute) {
    rruleOptions.byminute = recurrenceRule.byMinute;
  }

  if (recurrenceRule.bySecond) {
    rruleOptions.bysecond = recurrenceRule.bySecond;
  }

  if (recurrenceRule.wkst) {
    rruleOptions.wkst = mapWeekdayToRRule(recurrenceRule.wkst);
  }

  // Generate all recurrence dates
  const rule = new RRule(rruleOptions);
  const dates = rule.all();

  // Convert to { start, end } pairs
  return dates.map((date) => ({
    start: date,
    end: new Date(date.getTime() + duration),
  }));
}
