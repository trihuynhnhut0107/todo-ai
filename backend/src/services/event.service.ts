import { AppDataSource } from "../data-source";
import { Event } from "../entities/event.entity";
import { Workspace } from "../entities/workspace.entity";
import { User } from "../entities/user.entity";
import { In } from "typeorm";
import {
  CreateEventDto,
  UpdateEventDto,
  EventResponse,
  EventQueryDto,
} from "../dtos/event.dto";

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
    await this.verifyWorkspaceAccess(
      createDto.workspaceId,
      userId
    );

    // Validate dates
    const start = new Date(createDto.start);
    const end = new Date(createDto.end);

    if (end <= start) {
      throw new Error("End time must be after start time");
    }

    // Check for overlapping events (including partial overlaps and boundary touches)
    await this.checkEventOverlap(createDto.workspaceId, start, end);

    // Get assignees if provided
    let assignees: User[] = [];
    if (createDto.assigneeIds && createDto.assigneeIds.length > 0) {
      assignees = await this.userRepository.findBy({
        id: In(createDto.assigneeIds),
      });

      if (assignees.length !== createDto.assigneeIds.length) {
        throw new Error("One or more assignees not found");
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
      location: createDto.location,
      color: createDto.color || "#3B82F6",
      isAllDay: createDto.isAllDay || false,
      recurrenceRule: createDto.recurrenceRule,
      tags: createDto.tags,
    });

    const savedEvent = await this.eventRepository.save(event);

    return this.formatEventResponse(savedEvent);
  }

  /**
   * Get events with optional filters
   */
  async getEvents(
    userId: string,
    query: EventQueryDto
  ): Promise<EventResponse[]> {
    if (
      !query.status &&
      !query.assigneeId &&
      query.startDate &&
      query.endDate &&
      query.workspaceId
    ) {
      return this.getEventsByTime(
        userId,
        new Date(query.startDate),
        new Date(query.endDate),
        query.workspaceId
      );
    }
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

    // Filter by date range (find events that overlap the range)
    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      queryBuilder.andWhere(
        "(event.start < :endDate AND event.end > :startDate)",
        {
          startDate,
          endDate,
        }
      );
    } else if (query.startDate) {
      const startDate = new Date(query.startDate);
      queryBuilder.andWhere("event.end > :startDate", { startDate });
    } else if (query.endDate) {
      const endDate = new Date(query.endDate);
      queryBuilder.andWhere("event.start < :endDate", { endDate });
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
   * Get events by specific day
   * @param workspaceId - Optional workspace ID to filter events
   * @param userId - User ID to verify access
   * @param date - Date to get events for
   */
  async getEventsByDay(
    userId: string,
    date: Date,
    workspaceId?: string
  ): Promise<EventResponse[]> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return this.getEvents(userId, {
      workspaceId,
      startDate: dayStart.toISOString(),
      endDate: dayEnd.toISOString(),
    });
  }

  /**
   * Get events by date range with overlap detection
   * Returns all events that overlap with the specified date range
   * @param userId - User ID to verify access
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @param workspaceId - Optional workspace ID to filter events
   */
  async getEventsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    workspaceId?: string
  ): Promise<EventResponse[]> {
    return this.getEvents(userId, {
      workspaceId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }

  /**
   * Get events that overlap with the given time range
   * If start === end: returns events containing that timestamp
   * If start !== end: returns events overlapping that range
   * @param userId - User ID to verify access
   * @param start - Start of time range
   * @param end - End of time range
   * @param workspaceId - Optional workspace ID to filter events
   */
  async getEventsByTime(
    userId: string,
    start: Date,
    end: Date,
    workspaceId?: string
  ): Promise<EventResponse[]> {
    const queryBuilder = this.eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.workspace", "workspace")
      .leftJoinAndSelect("workspace.members", "workspaceMember")
      .leftJoinAndSelect("event.assignees", "assignee")
      .where("(workspace.ownerId = :userId OR workspaceMember.id = :userId)", {
        userId,
      })
      .andWhere("(event.start <= :end AND event.end >= :start)", { start, end });

    // Filter by workspace if provided
    if (workspaceId) {
      queryBuilder.andWhere("event.workspaceId = :workspaceId", { workspaceId });
    }

    queryBuilder.orderBy("event.start", "ASC");

    const events = await queryBuilder.getMany();

    return events.map((event) => this.formatEventResponse(event));
  }

  /**
   * Get upcoming events (future events)
   * @param userId - User ID to verify access
   * @param limit - Maximum number of events to return
   * @param workspaceId - Optional workspace ID to filter events
   */
  async getUpcomingEvents(
    userId: string,
    limit: number = 10,
    workspaceId?: string
  ): Promise<EventResponse[]> {
    const now = new Date();

    const queryBuilder = this.eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.workspace", "workspace")
      .leftJoinAndSelect("workspace.members", "workspaceMember")
      .leftJoinAndSelect("event.assignees", "assignee")
      .where("(workspace.ownerId = :userId OR workspaceMember.id = :userId)", {
        userId,
      })
      .andWhere("event.start > :now", { now });

    // Filter by workspace if provided
    if (workspaceId) {
      queryBuilder.andWhere("event.workspaceId = :workspaceId", { workspaceId });
    }

    const events = await queryBuilder
      .orderBy("event.start", "ASC")
      .take(limit)
      .getMany();

    return events.map((event) => this.formatEventResponse(event));
  }

  /**
   * Get current event (event happening right now)
   * @param userId - User ID to verify access
   * @param workspaceId - Optional workspace ID to filter events
   */
  async getCurrentEvent(
    userId: string,
    workspaceId?: string
  ): Promise<EventResponse | null> {
    const now = new Date();

    const queryBuilder = this.eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.workspace", "workspace")
      .leftJoinAndSelect("workspace.members", "workspaceMember")
      .leftJoinAndSelect("event.assignees", "assignee")
      .where("(workspace.ownerId = :userId OR workspaceMember.id = :userId)", {
        userId,
      })
      .andWhere("event.start <= :now", { now })
      .andWhere("event.end > :now", { now });

    // Filter by workspace if provided
    if (workspaceId) {
      queryBuilder.andWhere("event.workspaceId = :workspaceId", { workspaceId });
    }

    const event = await queryBuilder.orderBy("event.start", "DESC").getOne();

    return event ? this.formatEventResponse(event) : null;
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
      throw new Error("Event not found");
    }

    // Check if user is owner of workspace or creator of event
    const hasAccess =
      event.workspace.ownerId === userId || event.createdById === userId;

    if (!hasAccess) {
      throw new Error("Access denied");
    }

    // Validate dates if provided
    if (updateDto.start || updateDto.end) {
      const start = updateDto.start ? new Date(updateDto.start) : event.start;
      const end = updateDto.end ? new Date(updateDto.end) : event.end;

      if (end <= start) {
        throw new Error("End time must be after start time");
      }

      // Check for overlapping events with other events (excluding current event)
      await this.checkEventOverlap(event.workspaceId, start, end, eventId);

      event.start = start;
      event.end = end;
    }

    // Update other fields
    if (updateDto.name !== undefined) event.name = updateDto.name;
    if (updateDto.description !== undefined)
      event.description = updateDto.description;
    if (updateDto.status !== undefined) event.status = updateDto.status as any;
    if (updateDto.location !== undefined) event.location = updateDto.location;
    if (updateDto.color !== undefined) event.color = updateDto.color;
    if (updateDto.isAllDay !== undefined) event.isAllDay = updateDto.isAllDay;
    if (updateDto.recurrenceRule !== undefined)
      event.recurrenceRule = updateDto.recurrenceRule;
    if (updateDto.tags !== undefined) event.tags = updateDto.tags;
    if (updateDto.metadata !== undefined) event.metadata = updateDto.metadata;

    const updatedEvent = await this.eventRepository.save(event);

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
   * Check for event conflicts (overlaps and boundary touches)
   * Throws error if conflict found, otherwise returns without error
   * @param workspaceId - Workspace to check within
   * @param start - Event start time
   * @param end - Event end time
   * @param excludeEventId - Optional event ID to exclude from check (for updates)
   */
  private async checkEventOverlap(
    workspaceId: string,
    start: Date,
    end: Date,
    excludeEventId?: string
  ): Promise<void> {
    let query = this.eventRepository
      .createQueryBuilder("event")
      .where("event.workspaceId = :workspaceId", { workspaceId })
      // Check for any overlap: existing event starts before new event ends AND existing event ends after new event starts
      .andWhere("(event.start < :end AND event.end > :start)", { start, end });

    // If updating, exclude the current event from conflict check
    if (excludeEventId) {
      query = query.andWhere("event.id != :excludeEventId", {
        excludeEventId,
      });
    }

    const conflictingEvent = await query.getOne();

    if (conflictingEvent) {
      throw new Error(
        `An event already exists during this time period. Conflicting event: "${
          conflictingEvent.name
        }" from ${conflictingEvent.start.toLocaleString()} to ${conflictingEvent.end.toLocaleString()}`
      );
    }
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
