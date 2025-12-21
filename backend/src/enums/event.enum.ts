export enum EventStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// iCalendar RRULE Enums (RFC 5545)
// https://datatracker.ietf.org/doc/html/rfc5545#section-3.3.10

/**
 * Recurrence frequency - REQUIRED in RRULE
 * Identifies the type of recurrence rule
 */
export enum RecurrenceFrequency {
  SECONDLY = "SECONDLY",
  MINUTELY = "MINUTELY",
  HOURLY = "HOURLY",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

/**
 * Day of week identifier for BYDAY rule part
 * Can be prefixed with a number (e.g., -1SU = last Sunday)
 */
export enum Weekday {
  SUNDAY = "SU",
  MONDAY = "MO",
  TUESDAY = "TU",
  WEDNESDAY = "WE",
  THURSDAY = "TH",
  FRIDAY = "FR",
  SATURDAY = "SA",
}

/**
 * Month identifier for BYMONTH rule part
 */
export enum Month {
  JANUARY = 1,
  FEBRUARY = 2,
  MARCH = 3,
  APRIL = 4,
  MAY = 5,
  JUNE = 6,
  JULY = 7,
  AUGUST = 8,
  SEPTEMBER = 9,
  OCTOBER = 10,
  NOVEMBER = 11,
  DECEMBER = 12,
}

/**
 * Interface for structured RRULE components
 * Used to build iCalendar recurrence rules
 *
 * Examples:
 * - Daily until Dec 2026: { freq: RecurrenceFrequency.DAILY, until: new Date("2026-12-31") }
 * - Every Monday until Jun 2025: { freq: RecurrenceFrequency.WEEKLY, byDay: [Weekday.MONDAY], until: new Date("2025-06-30") }
 * - Last day of month until end of year: { freq: RecurrenceFrequency.MONTHLY, byMonthDay: [-1], until: new Date("2025-12-31") }
 * - First Friday of each month: { freq: RecurrenceFrequency.MONTHLY, byDay: ["1FR"], until: new Date("2026-01-01") }
 */
export interface RecurrenceRule {
  freq: RecurrenceFrequency; // REQUIRED
  until: Date; // REQUIRED - End date for recurrence
  interval?: number; // Default: 1
  byDay?: (Weekday | string)[]; // Day of week (can include position like "1MO", "-1FR")
  byMonthDay?: number[]; // Day of month (1-31, negative for counting from end)
  byMonth?: Month[]; // Month of year
  bySetPos?: number[]; // Specify which occurrence(s) within the set
  byWeekNo?: number[]; // Week number of year (1-53)
  byYearDay?: number[]; // Day of year (1-366, negative for counting from end)
  byHour?: number[]; // Hour of day (0-23)
  byMinute?: number[]; // Minute of hour (0-59)
  bySecond?: number[]; // Second of minute (0-60)
  wkst?: Weekday; // Week start day (default: MONDAY)
}
