import { tool } from "langchain";
import { z } from "zod";
import { EventService } from "../services/event.service";
import { EventStatus } from "../enums/event.enum";

/**
 * LangChain tools for Event operations
 * Each tool wraps a corresponding EventService method for AI agent usage
 */

const eventService = new EventService();

/**
 * Tool: Create Event
 * Creates a new event in a workspace with specified details
 */
export const createEventTool = tool(
  async (input) => {
    try {
      const result = await eventService.createEvent(input.userId, {
        name: input.name,
        start: new Date(input.start),
        end: new Date(input.end),
        workspaceId: input.workspaceId,
        description: input.description,
        location: input.location,
        assigneeIds: input.assigneeIds,
        tags: input.tags,
        color: input.color,
        isAllDay: input.isAllDay,
        recurrenceRule: input.recurrenceRule,
        status: input.status,
        metadata: input.metadata,
      });
      return JSON.stringify({
        success: true,
        event: result,
        message: `Event "${result.name}" created successfully`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "create_event",
    description:
      "Create a new event in a workspace. Requires event name, start time, end time, and workspace ID. Optionally accepts description, location, assignees, tags, color, recurrence rules, and other metadata. Use this when the user wants to schedule a meeting, create a task with a deadline, or add any time-based activity.",
    schema: z.object({
      userId: z.string().describe("The ID of the user creating the event"),
      name: z.string().describe("The name/title of the event"),
      start: z
        .string()
        .describe("Start date/time in ISO format (e.g., '2024-11-27T10:00:00Z')"),
      end: z
        .string()
        .describe("End date/time in ISO format (e.g., '2024-11-27T11:00:00Z')"),
      workspaceId: z
        .string()
        .describe("The workspace ID where the event should be created"),
      description: z
        .string()
        .optional()
        .describe("Optional detailed description of the event"),
      location: z
        .string()
        .optional()
        .describe("Optional location (e.g., 'Conference Room A' or 'Zoom')"),
      assigneeIds: z
        .array(z.string())
        .optional()
        .describe("Optional array of user IDs to assign to this event"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Optional tags for categorization (e.g., ['meeting', 'urgent'])"),
      color: z
        .string()
        .optional()
        .describe("Optional color code for the event (e.g., '#3B82F6')"),
      isAllDay: z
        .boolean()
        .optional()
        .describe("Whether this is an all-day event"),
      recurrenceRule: z
        .string()
        .optional()
        .describe("Optional recurrence rule in iCalendar RRULE format"),
      status: z
        .nativeEnum(EventStatus)
        .optional()
        .describe("Optional event status (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)"),
      metadata: z
        .record(z.string(), z.unknown())
        .optional()
        .describe("Optional additional metadata as key-value pairs"),
    }),
  }
);

/**
 * Tool: Get Events
 * Retrieves events with optional filtering by workspace, date range, status, and assignee
 */
export const getEventsTool = tool(
  async (input) => {
    try {
      const result = await eventService.getEvents(input.userId, {
        workspaceId: input.workspaceId,
        startDate: input.startDate,
        endDate: input.endDate,
        status: input.status,
        assigneeId: input.assigneeId,
      });
      return JSON.stringify({
        success: true,
        events: result,
        count: result.length,
        message: `Found ${result.length} event(s)`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "get_events",
    description:
      "Retrieve events with optional filters. Can filter by workspace, date range, status, and assignee. Use this to find events, check schedules, or list upcoming tasks. Returns all accessible events if no filters provided.",
    schema: z.object({
      userId: z.string().describe("The ID of the user requesting events"),
      workspaceId: z
        .string()
        .optional()
        .describe("Filter by specific workspace ID"),
      startDate: z
        .string()
        .optional()
        .describe("Filter events starting from this date (ISO format)"),
      endDate: z
        .string()
        .optional()
        .describe("Filter events ending before this date (ISO format)"),
      status: z
        .string()
        .optional()
        .describe("Filter by event status (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)"),
      assigneeId: z
        .string()
        .optional()
        .describe("Filter events assigned to this user ID"),
    }),
  }
);

/**
 * Tool: Get Event by ID
 * Retrieves a specific event by its ID
 */
export const getEventByIdTool = tool(
  async (input) => {
    try {
      const result = await eventService.getEventById(
        input.eventId,
        input.userId
      );
      return JSON.stringify({
        success: true,
        event: result,
        message: `Event "${result.name}" retrieved successfully`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "get_event_by_id",
    description:
      "Retrieve detailed information about a specific event using its ID. Use this when you need to get full details of a particular event, or when the user asks about a specific event by reference.",
    schema: z.object({
      userId: z.string().describe("The ID of the user requesting the event"),
      eventId: z.string().describe("The ID of the event to retrieve"),
    }),
  }
);

/**
 * Tool: Update Event
 * Updates an existing event's properties
 */
export const updateEventTool = tool(
  async (input) => {
    try {
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.start !== undefined) updateData.start = new Date(input.start);
      if (input.end !== undefined) updateData.end = new Date(input.end);
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.location !== undefined) updateData.location = input.location;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.isAllDay !== undefined) updateData.isAllDay = input.isAllDay;
      if (input.recurrenceRule !== undefined)
        updateData.recurrenceRule = input.recurrenceRule;
      if (input.metadata !== undefined) updateData.metadata = input.metadata;

      const result = await eventService.updateEvent(
        input.eventId,
        input.userId,
        updateData
      );
      return JSON.stringify({
        success: true,
        event: result,
        message: `Event "${result.name}" updated successfully`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "update_event",
    description:
      "Update an existing event. Can modify name, dates, description, location, status, assignees, tags, color, and other properties. Only the creator or workspace owner can update events. Use this when the user wants to change event details, reschedule, or update status.",
    schema: z.object({
      userId: z.string().describe("The ID of the user updating the event"),
      eventId: z.string().describe("The ID of the event to update"),
      name: z.string().optional().describe("Updated event name"),
      start: z
        .string()
        .optional()
        .describe("Updated start date/time in ISO format"),
      end: z.string().optional().describe("Updated end date/time in ISO format"),
      description: z.string().optional().describe("Updated description"),
      location: z.string().optional().describe("Updated location"),
      status: z
        .nativeEnum(EventStatus)
        .optional()
        .describe("Updated status (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)"),
      tags: z.array(z.string()).optional().describe("Updated tags array"),
      color: z.string().optional().describe("Updated color code"),
      isAllDay: z.boolean().optional().describe("Updated all-day flag"),
      recurrenceRule: z.string().optional().describe("Updated recurrence rule"),
      metadata: z.record(z.string(), z.unknown()).optional().describe("Updated metadata"),
    }),
  }
);

/**
 * Tool: Delete Event
 * Deletes an event permanently
 */
export const deleteEventTool = tool(
  async (input) => {
    try {
      await eventService.deleteEvent(input.eventId, input.userId);
      return JSON.stringify({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "delete_event",
    description:
      "Permanently delete an event. Only the event creator or workspace owner can delete events. Use this when the user wants to cancel and remove an event completely. This action cannot be undone.",
    schema: z.object({
      userId: z.string().describe("The ID of the user deleting the event"),
      eventId: z.string().describe("The ID of the event to delete"),
    }),
  }
);

/**
 * Tool: Assign Users to Event
 * Assigns one or more users to an event
 */
export const assignUsersToEventTool = tool(
  async (input) => {
    try {
      const result = await eventService.assignUsers(
        input.eventId,
        input.userId,
        input.userIds
      );
      return JSON.stringify({
        success: true,
        event: result,
        message: `Assigned ${input.userIds.length} user(s) to event "${result.name}"`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "assign_users_to_event",
    description:
      "Assign one or more users to an event. Only the event creator or workspace owner can assign users. Use this when adding participants to a meeting or assigning team members to a task.",
    schema: z.object({
      userId: z.string().describe("The ID of the user performing the assignment"),
      eventId: z.string().describe("The ID of the event to assign users to"),
      userIds: z
        .array(z.string())
        .describe("Array of user IDs to assign to the event"),
    }),
  }
);

/**
 * Tool: Unassign User from Event
 * Removes a user from an event's assignees
 */
export const unassignUserFromEventTool = tool(
  async (input) => {
    try {
      const result = await eventService.unassignUser(
        input.eventId,
        input.userId,
        input.userIdToRemove
      );
      return JSON.stringify({
        success: true,
        event: result,
        message: `Removed user from event "${result.name}"`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "unassign_user_from_event",
    description:
      "Remove a user from an event's assignees. Only the event creator or workspace owner can unassign users. Use this when removing a participant from a meeting or unassigning a team member from a task.",
    schema: z.object({
      userId: z
        .string()
        .describe("The ID of the user performing the unassignment"),
      eventId: z
        .string()
        .describe("The ID of the event to unassign the user from"),
      userIdToRemove: z
        .string()
        .describe("The ID of the user to remove from the event"),
    }),
  }
);

/**
 * Export all event tools as an array for easy registration
 */
export const eventTools = [
  createEventTool,
  getEventsTool,
  getEventByIdTool,
  updateEventTool,
  deleteEventTool,
  assignUsersToEventTool,
  unassignUserFromEventTool,
];
