import {
  RecurrenceFrequency,
  Weekday,
  RecurrenceRule,
} from "@/enum/recurrence";

/**
 * Build an iCalendar RRULE string from recurrence parameters
 * @param frequency - Recurrence frequency (DAILY, WEEKLY, MONTHLY, YEARLY)
 * @param until - End date for recurrence (REQUIRED)
 * @param interval - Interval between occurrences (default: 1)
 * @param byDay - Days of week for WEEKLY frequency
 * @returns RRULE string (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20261231T235959Z")
 */
export function buildRRule(params: {
  frequency: RecurrenceFrequency;
  until: Date;
  interval?: number;
  byDay?: Weekday[];
  startDate?: Date; // Used to determine default day for weekly
}): string {
  const parts: string[] = [`FREQ=${params.frequency}`];

  // Add interval if > 1
  if (params.interval && params.interval > 1) {
    parts.push(`INTERVAL=${params.interval}`);
  }

  // Add byDay for weekly frequency
  if (params.byDay && params.byDay.length > 0) {
    parts.push(`BYDAY=${params.byDay.join(",")}`);
  }

  // Format UNTIL as YYYYMMDDTHHMMSSZ (UTC)
  const utcDate = new Date(params.until);
  const formatted = utcDate
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  parts.push(`UNTIL=${formatted}`);

  return parts.join(";");
}

/**
 * Build RRULE for common recurrence patterns
 */
export const buildPresetRRule = {
  // Daily patterns
  daily: (until: Date): string => {
    return buildRRule({ frequency: RecurrenceFrequency.DAILY, until });
  },

  // Weekdays (Mon-Fri)
  weekdays: (until: Date): string => {
    return buildRRule({
      frequency: RecurrenceFrequency.WEEKLY,
      until,
      byDay: [
        Weekday.MONDAY,
        Weekday.TUESDAY,
        Weekday.WEDNESDAY,
        Weekday.THURSDAY,
        Weekday.FRIDAY,
      ],
    });
  },

  // Weekly patterns
  weekly: (until: Date, days?: Weekday[], startDate?: Date): string => {
    let byDay = days;
    if (!byDay && startDate) {
      const dayOfWeek = startDate.getDay();
      const weekdayMap: Weekday[] = [
        Weekday.SUNDAY,
        Weekday.MONDAY,
        Weekday.TUESDAY,
        Weekday.WEDNESDAY,
        Weekday.THURSDAY,
        Weekday.FRIDAY,
        Weekday.SATURDAY,
      ];
      byDay = [weekdayMap[dayOfWeek]];
    }
    return buildRRule({ frequency: RecurrenceFrequency.WEEKLY, until, byDay });
  },
  biweekly: (until: Date, days?: Weekday[], startDate?: Date): string => {
    let byDay = days;
    if (!byDay && startDate) {
      const dayOfWeek = startDate.getDay();
      const weekdayMap: Weekday[] = [
        Weekday.SUNDAY,
        Weekday.MONDAY,
        Weekday.TUESDAY,
        Weekday.WEDNESDAY,
        Weekday.THURSDAY,
        Weekday.FRIDAY,
        Weekday.SATURDAY,
      ];
      byDay = [weekdayMap[dayOfWeek]];
    }
    return buildRRule({ frequency: RecurrenceFrequency.WEEKLY, until, interval: 2, byDay });
  },

  // Monthly patterns
  monthly: (until: Date): string => {
    return buildRRule({ frequency: RecurrenceFrequency.MONTHLY, until });
  },
  bimonthly: (until: Date): string => {
    return buildRRule({ frequency: RecurrenceFrequency.MONTHLY, until, interval: 2 });
  },
  quarterly: (until: Date): string => {
    return buildRRule({ frequency: RecurrenceFrequency.MONTHLY, until, interval: 3 });
  },

  // Yearly patterns
  yearly: (until: Date): string => {
    return buildRRule({ frequency: RecurrenceFrequency.YEARLY, until });
  },
};

/**
 * Parse a recurrence preset value and build the RRULE string
 * @param presetValue - Preset value (e.g., "daily", "weekly", "monthly")
 * @param until - End date for recurrence
 * @param startDate - Start date of the event (used for weekly to determine day)
 * @param days - Optional specific days for weekly/biweekly patterns
 * @returns RRULE string
 */
export function buildRRuleFromPreset(
  presetValue: string,
  until: Date,
  startDate?: Date,
  days?: Weekday[]
): string {
  switch (presetValue) {
    case "daily":
      return buildPresetRRule.daily(until);
    case "weekdays":
      return buildPresetRRule.weekdays(until);
    case "weekly":
      return buildPresetRRule.weekly(until, days, startDate);
    case "biweekly":
      return buildPresetRRule.biweekly(until, days, startDate);
    case "monthly":
      return buildPresetRRule.monthly(until);
    case "bimonthly":
      return buildPresetRRule.bimonthly(until);
    case "quarterly":
      return buildPresetRRule.quarterly(until);
    case "yearly":
      return buildPresetRRule.yearly(until);
    default:
      throw new Error(`Unknown recurrence preset: ${presetValue}`);
  }
}

/**
 * Format a date to readable string
 */
export function formatRecurrenceEndDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
