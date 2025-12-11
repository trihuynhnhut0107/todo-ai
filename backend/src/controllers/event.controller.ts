import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Request,
} from "tsoa";
import { EventService } from "../services/event.service";
import {
  CreateEventDto,
  UpdateEventDto,
  EventResponse,
  AssignEventDto,
  UnassignEventDto,
  EventQueryDto,
} from "../dtos/event.dto";
import { ApiResponse, ErrorResponse } from "../types/api-response.types";

@Route("api/events")
@Tags("Events")
@Security("jwt")
export class EventController extends Controller {
  private eventService = new EventService();

  /**
   * Create a new event
   * @summary Create an event
   * @param createDto Event creation details
   * @returns Newly created event
   */
  @Post()
  @SuccessResponse("201", "Event created successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("404", "Workspace not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async createEvent(
    @Body() createDto: CreateEventDto,
    @Request() request: Express.Request
  ): Promise<ApiResponse<EventResponse>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      if (
        !createDto.name ||
        !createDto.start ||
        !createDto.end ||
        !createDto.workspaceId
      ) {
        this.setStatus(400);
        throw new Error(
          "Name, start time, end time, and workspace ID are required"
        );
      }

      const event = await this.eventService.createEvent(userId, createDto);

      this.setStatus(201);
      return {
        success: true,
        message: "Event created successfully",
        data: event,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Handle API errors with statusCode property (BadRequestError, ValidationError, etc.)
      if (error instanceof Object && 'statusCode' in error) {
        const apiError = error as { statusCode: number };
        this.setStatus(apiError.statusCode);
      } else if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (
        error instanceof Error &&
        (error.message === "Workspace not found or access denied" ||
          error.message === "One or more assignees not found")
      ) {
        this.setStatus(404);
      } else if (
        error instanceof Error &&
        error.message === "End time must be after start time"
      ) {
        this.setStatus(400);
      } else if (error instanceof Error) {
        this.setStatus(400);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Get events with optional filters
   * @summary Get events
   * @param workspaceId Filter by workspace ID
   * @param startDate Filter events starting from this date
   * @param endDate Filter events ending before this date
   * @param status Filter by event status
   * @param assigneeId Filter by assignee user ID
   * @returns List of events
   */
  @Get()
  @SuccessResponse("200", "Events retrieved successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getEvents(
    @Request() request: Express.Request,
    @Query() workspaceId?: string,
    @Query() startDate?: string,
    @Query() endDate?: string,
    @Query() status?: string,
    @Query() assigneeId?: string
  ): Promise<ApiResponse<EventResponse[]>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      const query: EventQueryDto = {
        workspaceId,
        startDate,
        endDate,
        status,
        assigneeId,
      };

      const events = await this.eventService.getEvents(userId, query);

      return {
        success: true,
        message: "Events retrieved successfully",
        data: events,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Get event by ID
   * @summary Get event details
   * @param eventId Event ID
   * @returns Event details
   */
  @Get("{eventId}")
  @SuccessResponse("200", "Event retrieved successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("404", "Event not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getEventById(
    @Path() eventId: string,
    @Request() request: Express.Request
  ): Promise<ApiResponse<EventResponse>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      const event = await this.eventService.getEventById(eventId, userId);

      return {
        success: true,
        message: "Event retrieved successfully",
        data: event,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (
        error instanceof Error &&
        error.message === "Event not found or access denied"
      ) {
        this.setStatus(404);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Update event
   * @summary Update event
   * @param eventId Event ID
   * @param updateDto Event update details
   * @returns Updated event
   */
  @Put("{eventId}")
  @SuccessResponse("200", "Event updated successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("403", "Access denied")
  @Response<ErrorResponse>("404", "Event not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async updateEvent(
    @Path() eventId: string,
    @Body() updateDto: UpdateEventDto,
    @Request() request: Express.Request
  ): Promise<ApiResponse<EventResponse>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      const event = await this.eventService.updateEvent(
        eventId,
        userId,
        updateDto
      );

      return {
        success: true,
        message: "Event updated successfully",
        data: event,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Handle API errors with statusCode property (BadRequestError, ValidationError, etc.)
      if (error instanceof Object && 'statusCode' in error) {
        const apiError = error as { statusCode: number };
        this.setStatus(apiError.statusCode);
      } else if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (
        error instanceof Error &&
        error.message === "Event not found"
      ) {
        this.setStatus(404);
      } else if (error instanceof Error && error.message === "Access denied") {
        this.setStatus(403);
      } else if (
        error instanceof Error &&
        error.message === "End time must be after start time"
      ) {
        this.setStatus(400);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Delete event
   * @summary Delete event
   * @param eventId Event ID
   * @returns Success message
   */
  @Delete("{eventId}")
  @SuccessResponse("200", "Event deleted successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("403", "Access denied")
  @Response<ErrorResponse>("404", "Event not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async deleteEvent(
    @Path() eventId: string,
    @Request() request: Express.Request
  ): Promise<ApiResponse<void>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      await this.eventService.deleteEvent(eventId, userId);

      return {
        success: true,
        message: "Event deleted successfully",
        data: undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (
        error instanceof Error &&
        error.message === "Event not found"
      ) {
        this.setStatus(404);
      } else if (error instanceof Error && error.message === "Access denied") {
        this.setStatus(403);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Assign users to event
   * @summary Assign users to event
   * @param eventId Event ID
   * @param assignDto User IDs to assign
   * @returns Updated event
   */
  @Post("{eventId}/assignees")
  @SuccessResponse("200", "Users assigned successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("403", "Access denied")
  @Response<ErrorResponse>("404", "Event or users not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async assignUsers(
    @Path() eventId: string,
    @Body() assignDto: AssignEventDto,
    @Request() request: Express.Request
  ): Promise<ApiResponse<EventResponse>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      if (!assignDto.userIds || assignDto.userIds.length === 0) {
        this.setStatus(400);
        throw new Error("User IDs are required");
      }

      const event = await this.eventService.assignUsers(
        eventId,
        userId,
        assignDto.userIds
      );

      return {
        success: true,
        message: "Users assigned successfully",
        data: event,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (
        error instanceof Error &&
        error.message === "Event not found"
      ) {
        this.setStatus(404);
      } else if (error instanceof Error && error.message === "Access denied") {
        this.setStatus(403);
      } else if (
        error instanceof Error &&
        error.message === "One or more users not found"
      ) {
        this.setStatus(404);
      } else if (error instanceof Error) {
        this.setStatus(400);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Unassign user from event
   * @summary Unassign user from event
   * @param eventId Event ID
   * @param unassignDto User ID to unassign
   * @returns Updated event
   */
  @Delete("{eventId}/assignees")
  @SuccessResponse("200", "User unassigned successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("403", "Access denied")
  @Response<ErrorResponse>("404", "Event not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async unassignUser(
    @Path() eventId: string,
    @Body() unassignDto: UnassignEventDto,
    @Request() request: Express.Request
  ): Promise<ApiResponse<EventResponse>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      if (!unassignDto.userId) {
        this.setStatus(400);
        throw new Error("User ID is required");
      }

      const event = await this.eventService.unassignUser(
        eventId,
        userId,
        unassignDto.userId
      );

      return {
        success: true,
        message: "User unassigned successfully",
        data: event,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (
        error instanceof Error &&
        error.message === "Event not found"
      ) {
        this.setStatus(404);
      } else if (error instanceof Error && error.message === "Access denied") {
        this.setStatus(403);
      } else if (error instanceof Error) {
        this.setStatus(400);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }
}
