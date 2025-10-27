import { z } from "zod";

/**
 * Zod schema for event creation that mirrors CreateEventDto
 * Used for LangChain structured output validation
 */
export const CreateEventSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe("The event title/name (required)"),

  description: z
    .string()
    .optional()
    .describe("Detailed event description"),

  start: z
    .string()
    .describe("Event start date/time in ISO 8601 format (e.g., 2025-10-24T06:00:00)"),

  end: z
    .string()
    .describe("Event end date/time in ISO 8601 format (e.g., 2025-10-24T07:00:00)"),

  location: z
    .string()
    .optional()
    .describe("Physical or virtual location (e.g., 'Conference Room A', 'Zoom', 'https://meet.google.com/xyz')"),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .describe("Hex color code for calendar display (e.g., '#FF5733')"),

  isAllDay: z
    .boolean()
    .optional()
    .describe("True if event spans entire day(s)"),

  recurrenceRule: z
    .string()
    .optional()
    .describe("Recurrence pattern in iCal RRULE format (e.g., 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR')"),

  tags: z
    .array(z.string())
    .optional()
    .describe("Categorization tags (e.g., ['work', 'meeting', 'urgent'])"),

  assigneeIds: z
    .array(z.string())
    .optional()
    .describe("List of people's names mentioned to be invited or assigned"),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
