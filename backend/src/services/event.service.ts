import { AppDataSource } from "../data-source";
import { Event } from "../entities/event.entity";
import { Workspace } from "../entities/workspace.entity";
import { User } from "../entities/user.entity";
import { In, Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import {
  CreateEventDto,
  UpdateEventDto,
  EventResponse,
  EventQueryDto,
} from "../dtos/event.dto";
import { reminderService } from "./reminder.service";
import { cancelEventNotification } from "./notification-queue.service";
import {
  validateAndNormalizeLocation,
  validateTravelLogistics,
} from "../utils/location-validation";
import { BadRequestError } from "../utils/errors";

export class EventService {
  private eventRepository = AppDataSource.getRepository(Event);
  private workspaceRepository = AppDataSource.getRepository(Workspace);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Create a new event
   */
  async createEvent(
    userId: string,
    createDto: CreateEventDto
  ): Promise<EventResponse> {
    // Verify workspace exists and user has access
    await this.verifyWorkspaceAccess(createDto.workspaceId, userId);

    // Validate dates
    const start = new Date(createDto.start);
    const end = new Date(createDto.end);

    if (end <= start) {
      throw new BadRequestError("End time must be after start time");
    }

    // Get assignees if provided
    let assignees: User[] = [];
    if (createDto.assigneeIds && createDto.assigneeIds.length > 0) {
      assignees = await this.userRepository.findBy({
        id: In(createDto.assigneeIds),
      });

      if (assignees.length !== createDto.assigneeIds.length) {
        throw new BadRequestError("One or more assignees not found");
      }
    }

    // Validate and normalize location if provided
    let eventLocation: string | undefined = createDto.location;
    let eventLat: string | undefined = undefined;
    let eventLng: string | undefined = undefined;

    // Check if trying to provide only one coordinate (invalid)
    if (
      (createDto.lat !== undefined && createDto.lng === undefined) ||
      (createDto.lng !== undefined && createDto.lat === undefined)
    ) {
      throw new BadRequestError(
        "Both latitude and longitude must be provided together. Provide neither, or both."
      );
    }

    if (createDto.location || (createDto.lat && createDto.lng)) {
      const validatedLocation = await validateAndNormalizeLocation({
        location: createDto.location,
        lat: createDto.lat,
        lng: createDto.lng,
      });

      eventLocation = validatedLocation.location;
      eventLat = validatedLocation.lat;
      eventLng = validatedLocation.lng;

      // Validate travel logistics: find the most recent event that ends BEFORE this event starts
      const previousEvent = await this.eventRepository
        .createQueryBuilder("event")
        .where("event.createdById = :userId", { userId })
        .andWhere("event.lat IS NOT NULL")
        .andWhere("event.lng IS NOT NULL")
        .andWhere("event.end <= :eventStart", { eventStart: start })
        .orderBy("event.end", "DESC")
        .limit(1)
        .getOne();

      if (previousEvent) {
        const travelValidation = await validateTravelLogistics(
          start,
          validatedLocation,
          previousEvent
        );

        if (!travelValidation.isValid) {
          throw new BadRequestError(
            travelValidation.message ||
              "Travel logistics validation failed between events"
          );
        }
      }
    }

    const event = this.eventRepository.create({
      name: createDto.name,
      description: createDto.description,
      start,
      end,
      workspaceId: createDto.workspaceId,
      createdById: userId,
      assignees,
      location: eventLocation,
      lat: eventLat,
      lng: eventLng,
      color: createDto.color || "#3B82F6",
      isAllDay: createDto.isAllDay || false,
      recurrenceRule: createDto.recurrenceRule,
      tags: createDto.tags,
    });

    const savedEvent = await this.eventRepository.save(event);

    // Schedule notification for the event (15 minutes before)
    // await scheduleEventNotification(savedEvent.id, savedEvent.start);
    await reminderService.scheduleDefaultReminder(savedEvent);

    return this.formatEventResponse(savedEvent);
  }

  /**
   * Get events with optional filters
   */
  async getEvents(
    userId: string,
    query: EventQueryDto
  ): Promise<EventResponse[]> {
    const queryBuilder = this.eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.workspace", "workspace")
      .leftJoinAndSelect("workspace.members", "workspaceMember")
      .leftJoinAndSelect("event.assignees", "assignee")
      .where("(workspace.ownerId = :userId OR workspaceMember.id = :userId)", {
        userId,
      });

    // Filter by workspace
    if (query.workspaceId) {
      queryBuilder.andWhere("event.workspaceId = :workspaceId", {
        workspaceId: query.workspaceId,
      });
    }

    // Filter by date range
    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      queryBuilder.andWhere("event.start >= :startDate", { startDate });
      queryBuilder.andWhere("event.end <= :endDate", { endDate });
    } else if (query.startDate) {
      const startDate = new Date(query.startDate);
      queryBuilder.andWhere("event.start >= :startDate", { startDate });
    } else if (query.endDate) {
      const endDate = new Date(query.endDate);
      queryBuilder.andWhere("event.end <= :endDate", { endDate });
    }

    // Filter by status
    if (query.status) {
      queryBuilder.andWhere("event.status = :status", {
        status: query.status,
      });
    }

    // Filter by assignee
    if (query.assigneeId) {
      queryBuilder.andWhere("assignee.id = :assigneeId", {
        assigneeId: query.assigneeId,
      });
    }

    queryBuilder.orderBy("event.start", "ASC");

    const events = await queryBuilder.getMany();

    return events.map((event) => this.formatEventResponse(event));
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string, userId: string): Promise<EventResponse> {
    const event = await this.eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.workspace", "workspace")
      .leftJoinAndSelect("workspace.members", "workspaceMember")
      .leftJoinAndSelect("event.assignees", "assignee")
      .where("event.id = :eventId", { eventId })
      .andWhere(
        "(workspace.ownerId = :userId OR workspaceMember.id = :userId)",
        { userId }
      )
      .getOne();

    if (!event) {
      throw new Error("Event not found or access denied");
    }

    return this.formatEventResponse(event);
  }

  /**
   * Update event
   */
  async updateEvent(
    eventId: string,
    userId: string,
    updateDto: UpdateEventDto
  ): Promise<EventResponse> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ["workspace", "workspace.members"],
    });

    if (!event) {
      throw new BadRequestError("Event not found");
    }

    // Check if user is owner of workspace or creator of event
    const hasAccess =
      event.workspace.ownerId === userId || event.createdById === userId;

    if (!hasAccess) {
      throw new BadRequestError("Access denied");
    }

    // Validate dates if provided
    if (updateDto.start || updateDto.end) {
      const start = updateDto.start ? new Date(updateDto.start) : event.start;
      const end = updateDto.end ? new Date(updateDto.end) : event.end;

      if (end <= start) {
        throw new BadRequestError("End time must be after start time");
      }

      event.start = start;
      event.end = end;
    }

    // Update location with validation if provided
    if (
      updateDto.location !== undefined ||
      updateDto.lat !== undefined ||
      updateDto.lng !== undefined
    ) {
      // Check if trying to update only one coordinate (invalid)
      if (
        (updateDto.lat !== undefined && updateDto.lng === undefined) ||
        (updateDto.lng !== undefined && updateDto.lat === undefined)
      ) {
        throw new BadRequestError(
          "Both latitude and longitude must be provided together. Provide neither, or both."
        );
      }

      // If location or coordinates are being updated with valid data
      if (
        updateDto.location ||
        (updateDto.lat !== undefined && updateDto.lng !== undefined)
      ) {
        const validatedLocation = await validateAndNormalizeLocation({
          location: updateDto.location,
          lat: updateDto.lat,
          lng: updateDto.lng,
        });

        event.location = validatedLocation.location;
        event.lat = validatedLocation.lat;
        event.lng = validatedLocation.lng;

        // Validate travel logistics: find the most recent event that ends BEFORE this event starts
        const previousEvent = await this.eventRepository
          .createQueryBuilder("event")
          .where("event.createdById = :userId", { userId })
          .andWhere("event.id != :currentEventId", { currentEventId: eventId })
          .andWhere("event.lat IS NOT NULL")
          .andWhere("event.lng IS NOT NULL")
          .andWhere("event.end <= :eventStart", { eventStart: event.start })
          .orderBy("event.end", "DESC")
          .limit(1)
          .getOne();

        if (previousEvent) {
          const travelValidation = await validateTravelLogistics(
            event.start,
            validatedLocation,
            previousEvent
          );

          if (!travelValidation.isValid) {
            throw new BadRequestError(
              travelValidation.message ||
                "Travel logistics validation failed between events"
            );
          }
        }
      } else {
        // Clearing location (if explicitly set to undefined/null)
        if (updateDto.location === null || updateDto.location === undefined) {
          event.location = undefined;
          event.lat = undefined;
          event.lng = undefined;
        }
      }
    }

    // Update other fields
    if (updateDto.name !== undefined) event.name = updateDto.name;
    if (updateDto.description !== undefined)
      event.description = updateDto.description;
    if (updateDto.status !== undefined) event.status = updateDto.status as any;
    if (updateDto.color !== undefined) event.color = updateDto.color;
    if (updateDto.isAllDay !== undefined) event.isAllDay = updateDto.isAllDay;
    if (updateDto.recurrenceRule !== undefined)
      event.recurrenceRule = updateDto.recurrenceRule;
    if (updateDto.tags !== undefined) event.tags = updateDto.tags;
    if (updateDto.metadata !== undefined) event.metadata = updateDto.metadata;

    const updatedEvent = await this.eventRepository.save(event);

    // Reschedule notification if start time changed or event was updated
    if (updatedEvent.status !== "cancelled") {
      // await scheduleEventNotification(updatedEvent.id, updatedEvent.start);
      // Logic inside scheduleDefaultReminder handles updating the time
      await reminderService.scheduleDefaultReminder(updatedEvent);
    } else {
      // Cancel notification if event is cancelled
      await cancelEventNotification(updatedEvent.id);
    }

    return this.formatEventResponse(updatedEvent);
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ["workspace"],
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is owner of workspace or creator of event
    const hasAccess =
      event.workspace.ownerId === userId || event.createdById === userId;

    if (!hasAccess) {
      throw new Error("Access denied");
    }

    // Cancel scheduled notification before deleting
    await cancelEventNotification(eventId);

    await this.eventRepository.remove(event);
  }

  /**
   * Assign users to event
   */
  async assignUsers(
    eventId: string,
    userId: string,
    userIds: string[]
  ): Promise<EventResponse> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ["workspace", "assignees"],
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // Check access
    const hasAccess =
      event.workspace.ownerId === userId || event.createdById === userId;

    if (!hasAccess) {
      throw new Error("Access denied");
    }

    const users = await this.userRepository.findBy({
      id: In(userIds),
    });

    if (users.length !== userIds.length) {
      throw new Error("One or more users not found");
    }

    // Add only new assignees (avoid duplicates)
    const existingAssigneeIds = new Set(
      event.assignees?.map((a) => a.id) || []
    );
    const newAssignees = users.filter((u) => !existingAssigneeIds.has(u.id));

    event.assignees = [...(event.assignees || []), ...newAssignees];
    const updatedEvent = await this.eventRepository.save(event);

    return this.formatEventResponse(updatedEvent);
  }

  /**
   * Unassign user from event
   */
  async unassignUser(
    eventId: string,
    userId: string,
    userIdToRemove: string
  ): Promise<EventResponse> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ["workspace", "assignees"],
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // Check access
    const hasAccess =
      event.workspace.ownerId === userId || event.createdById === userId;

    if (!hasAccess) {
      throw new Error("Access denied");
    }

    event.assignees =
      event.assignees?.filter((a) => a.id !== userIdToRemove) || [];
    const updatedEvent = await this.eventRepository.save(event);

    return this.formatEventResponse(updatedEvent);
  }

  /**
   * Verify workspace access
   */
  private async verifyWorkspaceAccess(
    workspaceId: string,
    userId: string
  ): Promise<Workspace> {
    const workspace = await this.workspaceRepository
      .createQueryBuilder("workspace")
      .leftJoinAndSelect("workspace.members", "member")
      .where("workspace.id = :workspaceId", { workspaceId })
      .andWhere("(workspace.ownerId = :userId OR member.id = :userId)", {
        userId,
      })
      .getOne();

    if (!workspace) {
      throw new Error("Workspace not found or access denied");
    }

    return workspace;
  }

  /**
   * Format event response
   */
  private formatEventResponse(event: Event): EventResponse {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      start: event.start,
      end: event.end,
      status: event.status,
      location: event.location,
      lat: event.lat,
      lng: event.lng,
      color: event.color,
      isAllDay: event.isAllDay,
      recurrenceRule: event.recurrenceRule,
      tags: event.tags,
      metadata: event.metadata,
      workspaceId: event.workspaceId,
      createdById: event.createdById,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      assigneeIds: event.assignees?.map((assignee) => assignee.id),
    };
  }
}
