// Recurrence Enums - matches backend implementation exactly

/**
 * Recurrence frequency for RRULE
 * REQUIRED in all recurrence rules
 * Note: Matches backend enum exactly
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
 * Note: UNTIL is REQUIRED when creating recurring events
 */
export interface RecurrenceRule {
  freq: RecurrenceFrequency; // REQUIRED
  until: Date; // REQUIRED - End date for recurrence
  interval?: number; // Default: 1
  byDay?: (Weekday | string)[]; // Day of week
  byMonthDay?: number[]; // Day of month (1-31)
  byMonth?: Month[]; // Month of year
}

/**
 * User-friendly recurrence options for UI
 */
export interface RecurrenceOption {
  label: string;
  value: string; // Will be converted to RRULE string
  frequency: RecurrenceFrequency;
  description?: string;
}

/**
 * Common recurrence patterns for calendar events
 * Focuses on practical patterns (DAILY, WEEKLY, MONTHLY, YEARLY)
 * while supporting all backend frequencies
 */
export const RECURRENCE_PRESETS: RecurrenceOption[] = [
  // Daily patterns
  {
    label: "Daily",
    value: "daily",
    frequency: RecurrenceFrequency.DAILY,
    description: "Every day",
  },
  {
    label: "Weekdays (Mon-Fri)",
    value: "weekdays",
    frequency: RecurrenceFrequency.WEEKLY,
    description: "Monday to Friday",
  },

  // Weekly patterns
  {
    label: "Weekly",
    value: "weekly",
    frequency: RecurrenceFrequency.WEEKLY,
    description: "Every week on the same day",
  },
  {
    label: "Bi-Weekly",
    value: "biweekly",
    frequency: RecurrenceFrequency.WEEKLY,
    description: "Every 2 weeks",
  },

  // Monthly patterns
  {
    label: "Monthly",
    value: "monthly",
    frequency: RecurrenceFrequency.MONTHLY,
    description: "Same day each month",
  },
  {
    label: "Bi-Monthly",
    value: "bimonthly",
    frequency: RecurrenceFrequency.MONTHLY,
    description: "Every 2 months",
  },
  {
    label: "Quarterly",
    value: "quarterly",
    frequency: RecurrenceFrequency.MONTHLY,
    description: "Every 3 months",
  },

  // Yearly patterns
  {
    label: "Yearly",
    value: "yearly",
    frequency: RecurrenceFrequency.YEARLY,
    description: "Same date each year",
  },
];

/**
 * Weekday labels for UI display
 */
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  [Weekday.SUNDAY]: "Sunday",
  [Weekday.MONDAY]: "Monday",
  [Weekday.TUESDAY]: "Tuesday",
  [Weekday.WEDNESDAY]: "Wednesday",
  [Weekday.THURSDAY]: "Thursday",
  [Weekday.FRIDAY]: "Friday",
  [Weekday.SATURDAY]: "Saturday",
};

/**
 * Short weekday labels for compact UI
 */
export const WEEKDAY_SHORT_LABELS: Record<Weekday, string> = {
  [Weekday.SUNDAY]: "Sun",
  [Weekday.MONDAY]: "Mon",
  [Weekday.TUESDAY]: "Tue",
  [Weekday.WEDNESDAY]: "Wed",
  [Weekday.THURSDAY]: "Thu",
  [Weekday.FRIDAY]: "Fri",
  [Weekday.SATURDAY]: "Sat",
};
