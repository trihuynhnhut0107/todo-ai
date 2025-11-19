/**
 * Date/Time utility functions using dayjs
 * Handles UTC date/time formatting for prompts and timezone context
 */

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Get current UTC date/time in ISO 8601 format
 * @returns ISO 8601 formatted UTC datetime (e.g., "2025-01-15T10:30:45Z")
 */
export function getCurrentUtcDateTime(): string {
  return dayjs.utc().toISOString();
}

/**
 * Get current UTC date only (no time)
 * @returns Date in YYYY-MM-DD format (e.g., "2025-01-15")
 */
export function getCurrentUtcDate(): string {
  return dayjs.utc().format("YYYY-MM-DD");
}

/**
 * Get timezone offset information for prompt context
 * @param timezoneIdentifier - Optional IANA timezone (e.g., "Asia/Bangkok"). If not provided, uses system timezone.
 * @returns Object with timezone information
 */
export function getTimezoneContext(timezoneIdentifier?: string): {
  utcDate: string;
  utcDateTime: string;
  localDate: string;
  localDateTime: string;
  timezoneIdentifier: string;
  timezoneLabel: string;
  offsetHours: number;
} {
  const tz = timezoneIdentifier || dayjs.tz.guess();
  const utcNow = dayjs.utc();
  const localNow = dayjs.tz(tz);

  // Calculate offset in hours
  const offsetMinutes = localNow.utcOffset();
  const offsetHours = offsetMinutes / 60;
  const sign = offsetHours >= 0 ? "+" : "";
  const timezoneLabel = `GMT${sign}${offsetHours}`;

  return {
    utcDate: utcNow.format("YYYY-MM-DD"),
    utcDateTime: utcNow.toISOString(),
    localDate: localNow.format("YYYY-MM-DD"),
    localDateTime: localNow.format("YYYY-MM-DD HH:mm:ss"),
    timezoneIdentifier: tz,
    timezoneLabel,
    offsetHours,
  };
}

/**
 * Format context information for inclusion in prompts
 * This helps the LLM understand the current time context and timezone
 * @param timezoneIdentifier - Optional IANA timezone identifier
 * @returns Formatted string for prompt inclusion
 */
export function formatPromptDateTimeContext(
  timezoneIdentifier?: string
): string {
  const context = getTimezoneContext(timezoneIdentifier);
  return `Current UTC Date/Time: ${context.utcDateTime}
Current Local Date/Time: ${context.localDateTime} (${context.timezoneLabel}, Timezone: ${context.timezoneIdentifier})`;
}

/**
 * Add date/time context to prompt input variables
 * This ensures all prompts have access to current time for relative date parsing
 * @param input - Input variables for the prompt
 * @param timezoneIdentifier - Optional IANA timezone identifier
 * @returns Input variables with date/time context added
 */
export function addDateTimeContextToInput(
  input: Record<string, any> = {},
  timezoneIdentifier?: string
): Record<string, any> {
  const context = getTimezoneContext(timezoneIdentifier);
  return {
    ...input,
    currentUtcDate: context.utcDate,
    currentUtcDateTime: context.utcDateTime,
    currentLocalDate: context.localDate,
    currentLocalDateTime: context.localDateTime,
    timezoneIdentifier: context.timezoneIdentifier,
    timezoneLabel: context.timezoneLabel,
    timezoneOffsetHours: context.offsetHours,
  };
}

/**
 * Convert a local time string to UTC ISO string
 * Useful for converting user-provided times to UTC format
 * @param localTimeString - Time in any parseable format
 * @param timezoneIdentifier - IANA timezone identifier (e.g., "Asia/Bangkok")
 * @returns ISO 8601 UTC datetime string
 */
export function convertLocalToUtc(
  localTimeString: string,
  timezoneIdentifier?: string
): string {
  const tz = timezoneIdentifier || dayjs.tz.guess();
  return dayjs.tz(localTimeString, tz).utc().toISOString();
}

/**
 * Convert UTC time to local time string
 * @param utcTimeString - ISO 8601 UTC datetime string
 * @param timezoneIdentifier - IANA timezone identifier
 * @returns Local datetime string in format "YYYY-MM-DD HH:mm:ss"
 */
export function convertUtcToLocal(
  utcTimeString: string,
  timezoneIdentifier?: string
): string {
  const tz = timezoneIdentifier || dayjs.tz.guess();
  return dayjs.utc(utcTimeString).tz(tz).format("YYYY-MM-DD HH:mm:ss");
}

/**
 * Get current time in a specific timezone as formatted string
 * @param timezoneIdentifier - IANA timezone identifier
 * @returns Formatted string: "YYYY-MM-DD HH:mm:ss"
 */
export function getCurrentTimeInTimezone(
  timezoneIdentifier?: string
): string {
  const tz = timezoneIdentifier || dayjs.tz.guess();
  return dayjs.tz(tz).format("YYYY-MM-DD HH:mm:ss");
}
