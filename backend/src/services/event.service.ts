import { AppDataSource } from "../data-source";
import { Event } from "../entities/event.entity";
import { Workspace } from "../entities/workspace.entity";
import { User } from "../entities/user.entity";
import { In, Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import crypto from "crypto";
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
import { NotificationService } from "./notification.service";
import { parseRRule, validateRRule, generateRecurringEventInstances } from "../utils/recurrence.utils";

export class EventService {
  private eventRepository = AppDataSource.getRepository(Event);
  private workspaceRepository = AppDataSource.getRepository(Workspace);
  private userRepository = AppDataSource.getRepository(User);
  private notificationService = new NotificationService();

  /**
   * Check if an event overlaps with user's existing events
   * @param userId - User ID to check events for
   * @param start - Start date of the event to check
   * @param end - End date of the event to check
   * @param excludeRecurrenceGroupId - Optional recurrence group ID to exclude from check
   * @returns The overlapping event if found, null otherwise
   */
  private async checkEventOverlap(
    userId: string,
    start: Date,
    end: Date,
    excludeRecurrenceGroupId?: string
  ): Promise<Event | null> {
    const queryBuilder = this.eventRepository
      .createQueryBuilder("event")
      .where("event.createdById = :userId", { userId })
      .andWhere("event.status != :cancelledStatus", { cancelledStatus: "cancelled" })
      .andWhere(
        "(event.start < :end AND event.end > :start)",
        { start, end }
      );

    // Exclude events from the same recurrence group if specified
    if (excludeRecurrenceGroupId) {
      queryBuilder.andWhere(
        "(event.recurrenceGroupId IS NULL OR event.recurrenceGroupId != :excludeRecurrenceGroupId)",
        { excludeRecurrenceGroupId }
      );
    }

    return await queryBuilder.getOne();
  }

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

    // Validate recurrence rule if provided
    if (createDto.recurrenceRule) {
      try {
        const parsedRule = parseRRule(createDto.recurrenceRule);
        validateRRule(parsedRule);
      } catch (error) {
        throw new BadRequestError(
          `Invalid recurrence rule: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
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

    // Handle recurring events
    if (createDto.recurrenceRule) {
      const parsedRule = parseRRule(createDto.recurrenceRule);
      const duration = end.getTime() - start.getTime();

      // Generate all event instances
      const instances = generateRecurringEventInstances(start, duration, parsedRule);

      // Check for overlaps with each instance
      for (const instance of instances) {
        const overlap = await this.checkEventOverlap(
          userId,
          instance.start,
          instance.end
        );

        if (overlap) {
          throw new BadRequestError(
            `Event conflicts with existing event "${overlap.name}" at ${instance.start.toISOString()}`
          );
        }
      }

      // Generate a recurrence group ID for all instances
      const recurrenceGroupId = crypto.randomUUID();

      // Create all event instances
      const events = instances.map((instance) =>
        this.eventRepository.create({
          name: createDto.name,
          description: createDto.description,
          start: instance.start,
          end: instance.end,
          workspaceId: createDto.workspaceId,
          createdById: userId,
          assignees,
          location: eventLocation,
          lat: eventLat,
          lng: eventLng,
          color: createDto.color || "#3B82F6",
          isAllDay: createDto.isAllDay || false,
          recurrenceRule: createDto.recurrenceRule,
          recurrenceGroupId,
          tags: createDto.tags,
        })
      );

      // Save all instances
      const savedEvents = await this.eventRepository.save(events);

      // Schedule reminders for all instances
      for (const savedEvent of savedEvents) {
        await reminderService.scheduleDefaultReminder(savedEvent);
      }

      // Send notification to creator and assignees for the first event
      if (savedEvents.length > 0) {
        const notificationRecipients = new Set<string>();

        // Add creator's push token
        const creator = await this.userRepository.findOne({ where: { id: userId } });
        if (creator?.pushToken) {
          notificationRecipients.add(creator.pushToken);
        }

        // Add assignees' push tokens
        if (assignees.length > 0) {
          assignees.forEach((assignee) => {
            if (assignee.pushToken) {
              notificationRecipients.add(assignee.pushToken);
            }
          });
        }

        const pushTokens = Array.from(notificationRecipients);
        if (pushTokens.length > 0) {
          await this.notificationService.sendEventCreated(pushTokens, savedEvents[0]);
        }
      }

      // Return the first event instance
      return this.formatEventResponse(savedEvents[0]);
    }

    // Handle single event (no recurrence)
    // Check for overlap
    const overlap = await this.checkEventOverlap(userId, start, end);
    if (overlap) {
      throw new BadRequestError(
        `Event conflicts with existing event "${overlap.name}" at ${overlap.start.toISOString()}`
      );
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
      recurrenceRule: undefined,
      recurrenceGroupId: undefined,
      tags: createDto.tags,
    });

    const savedEvent = await this.eventRepository.save(event);

    // Schedule notification for the event (15 minutes before)
    // await scheduleEventNotification(savedEvent.id, savedEvent.start);
    await reminderService.scheduleDefaultReminder(savedEvent);

    // Send immediate notification to assignees and creator for calendar sync
    const notificationRecipients = new Set<string>();

    // Add creator's push token
    if (savedEvent.createdById) {
      const creator = await this.userRepository.findOne({ where: { id: savedEvent.createdById } });
      if (creator?.pushToken) {
        notificationRecipients.add(creator.pushToken);
      }
    }

    // Add assignees' push tokens
    if (assignees.length > 0) {
      assignees.forEach((assignee) => {
        if (assignee.pushToken) {
          notificationRecipients.add(assignee.pushToken);
        }
      });
    }

    const pushTokens = Array.from(notificationRecipients);
    console.log("Push tokens for event creation notification:", pushTokens);
    if (pushTokens.length > 0) {
      await this.notificationService.sendEventCreated(pushTokens, savedEvent);
    }

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
      relations: ["workspace", "workspace.members", "assignees", "createdBy"],
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

    // Handle recurrence group updates
    if (event.recurrenceGroupId) {
      // Delete this event and all future events in the recurrence group
      await this.eventRepository
        .createQueryBuilder()
        .delete()
        .from(Event)
        .where("recurrenceGroupId = :groupId", { groupId: event.recurrenceGroupId })
        .andWhere("start >= :eventStart", { eventStart: event.start })
        .execute();

      // Prepare updated event data
      const start = updateDto.start ? new Date(updateDto.start) : event.start;
      const end = updateDto.end ? new Date(updateDto.end) : event.end;

      if (end <= start) {
        throw new BadRequestError("End time must be after start time");
      }

      // Get assignees if provided
      let assignees = event.assignees || [];
      if (updateDto.assigneeIds && updateDto.assigneeIds.length > 0) {
        assignees = await this.userRepository.findBy({
          id: In(updateDto.assigneeIds),
        });

        if (assignees.length !== updateDto.assigneeIds.length) {
          throw new BadRequestError("One or more assignees not found");
        }
      }

      // Handle location validation
      let eventLocation = updateDto.location !== undefined ? updateDto.location : event.location;
      let eventLat = updateDto.lat !== undefined ? String(updateDto.lat) : event.lat;
      let eventLng = updateDto.lng !== undefined ? String(updateDto.lng) : event.lng;

      if (
        (updateDto.lat !== undefined && updateDto.lng === undefined) ||
        (updateDto.lng !== undefined && updateDto.lat === undefined)
      ) {
        throw new BadRequestError(
          "Both latitude and longitude must be provided together. Provide neither, or both."
        );
      }

      if (updateDto.location || (updateDto.lat && updateDto.lng)) {
        const validatedLocation = await validateAndNormalizeLocation({
          location: updateDto.location,
          lat: updateDto.lat,
          lng: updateDto.lng,
        });

        eventLocation = validatedLocation.location;
        eventLat = validatedLocation.lat;
        eventLng = validatedLocation.lng;
      }

      // Validate and parse updated recurrence rule
      const recurrenceRule = updateDto.recurrenceRule !== undefined
        ? updateDto.recurrenceRule
        : event.recurrenceRule;

      if (recurrenceRule) {
        try {
          const parsedRule = parseRRule(recurrenceRule);
          validateRRule(parsedRule);

          const duration = end.getTime() - start.getTime();

          // Generate new instances starting from the edited event's date
          const instances = generateRecurringEventInstances(start, duration, parsedRule);

          // Check for overlaps (excluding the recurrence group being updated)
          for (const instance of instances) {
            const overlap = await this.checkEventOverlap(
              userId,
              instance.start,
              instance.end,
              event.recurrenceGroupId
            );

            if (overlap) {
              throw new BadRequestError(
                `Event conflicts with existing event "${overlap.name}" at ${instance.start.toISOString()}`
              );
            }
          }

          // Create new event instances with updated data
          const newEvents = instances.map((instance) =>
            this.eventRepository.create({
              name: updateDto.name !== undefined ? updateDto.name : event.name,
              description: updateDto.description !== undefined ? updateDto.description : event.description,
              start: instance.start,
              end: instance.end,
              workspaceId: event.workspaceId,
              createdById: userId,
              assignees,
              location: eventLocation,
              lat: eventLat,
              lng: eventLng,
              color: updateDto.color !== undefined ? updateDto.color : event.color,
              isAllDay: updateDto.isAllDay !== undefined ? updateDto.isAllDay : event.isAllDay,
              recurrenceRule,
              recurrenceGroupId: event.recurrenceGroupId,
              tags: updateDto.tags !== undefined ? updateDto.tags : event.tags,
              metadata: updateDto.metadata !== undefined ? updateDto.metadata : event.metadata,
              status: updateDto.status !== undefined ? updateDto.status as any : event.status,
            })
          );

          // Save all new instances
          const savedEvents = await this.eventRepository.save(newEvents);

          // Schedule reminders for all new instances
          for (const savedEvent of savedEvents) {
            await reminderService.scheduleDefaultReminder(savedEvent);
          }

          // Send notification to creator and assignees
          if (savedEvents.length > 0) {
            const notificationRecipients = new Set<string>();

            // Add creator if not the one updating
            if (event.createdBy && event.createdBy.id !== userId && event.createdBy.pushToken) {
              notificationRecipients.add(event.createdBy.pushToken);
            }

            // Add assignees (excluding the user who made the update)
            if (assignees.length > 0) {
              assignees.forEach((assignee) => {
                if (assignee.id !== userId && assignee.pushToken) {
                  notificationRecipients.add(assignee.pushToken);
                }
              });
            }

            const pushTokens = Array.from(notificationRecipients);
            if (pushTokens.length > 0) {
              await this.notificationService.sendEventUpdated(pushTokens, savedEvents[0]);
            }
          }

          return this.formatEventResponse(savedEvents[0]);
        } catch (error) {
          throw new BadRequestError(
            `Invalid recurrence rule: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      } else {
        // No recurrence rule - create a single event
        const overlap = await this.checkEventOverlap(userId, start, end);
        if (overlap) {
          throw new BadRequestError(
            `Event conflicts with existing event "${overlap.name}" at ${overlap.start.toISOString()}`
          );
        }

        const newEvent = this.eventRepository.create({
          name: updateDto.name !== undefined ? updateDto.name : event.name,
          description: updateDto.description !== undefined ? updateDto.description : event.description,
          start,
          end,
          workspaceId: event.workspaceId,
          createdById: userId,
          assignees,
          location: eventLocation,
          lat: eventLat,
          lng: eventLng,
          color: updateDto.color !== undefined ? updateDto.color : event.color,
          isAllDay: updateDto.isAllDay !== undefined ? updateDto.isAllDay : event.isAllDay,
          recurrenceRule: undefined,
          recurrenceGroupId: undefined,
          tags: updateDto.tags !== undefined ? updateDto.tags : event.tags,
          metadata: updateDto.metadata !== undefined ? updateDto.metadata : event.metadata,
          status: updateDto.status !== undefined ? updateDto.status as any : event.status,
        });

        const savedEvent = await this.eventRepository.save(newEvent);
        await reminderService.scheduleDefaultReminder(savedEvent);

        return this.formatEventResponse(savedEvent);
      }
    }

    // Handle non-recurring event updates
    // Check for overlap before updating
    const newStart = updateDto.start ? new Date(updateDto.start) : event.start;
    const newEnd = updateDto.end ? new Date(updateDto.end) : event.end;

    if (newEnd <= newStart) {
      throw new BadRequestError("End time must be after start time");
    }

    const overlap = await this.checkEventOverlap(userId, newStart, newEnd);
    if (overlap && overlap.id !== eventId) {
      throw new BadRequestError(
        `Event conflicts with existing event "${overlap.name}" at ${overlap.start.toISOString()}`
      );
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

    // Validate recurrence rule if being updated
    if (updateDto.recurrenceRule !== undefined) {
      if (updateDto.recurrenceRule) {
        try {
          const parsedRule = parseRRule(updateDto.recurrenceRule);
          validateRRule(parsedRule);
        } catch (error) {
          throw new BadRequestError(
            `Invalid recurrence rule: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
      event.recurrenceRule = updateDto.recurrenceRule;
    }

    // Update other fields
    if (updateDto.name !== undefined) event.name = updateDto.name;
    if (updateDto.description !== undefined)
      event.description = updateDto.description;
    if (updateDto.status !== undefined) event.status = updateDto.status as any;
    if (updateDto.color !== undefined) event.color = updateDto.color;
    if (updateDto.isAllDay !== undefined) event.isAllDay = updateDto.isAllDay;
    if (updateDto.tags !== undefined) event.tags = updateDto.tags;
    if (updateDto.metadata !== undefined) event.metadata = updateDto.metadata;
    if (updateDto.calendarEventId !== undefined) event.calendarEventId = updateDto.calendarEventId;

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

    // Send immediate notification to assignees and creator for calendar sync
    // Collect unique push tokens (exclude the user who made the update)
    const notificationRecipients = new Set<string>();

    // Add creator if not the one updating
    if (event.createdBy && event.createdBy.id !== userId && event.createdBy.pushToken) {
      notificationRecipients.add(event.createdBy.pushToken);
    }

    // Add assignees (excluding the user who made the update)
    if (event.assignees) {
      event.assignees.forEach((assignee) => {
        if (assignee.id !== userId && assignee.pushToken) {
          notificationRecipients.add(assignee.pushToken);
        }
      });
    }

    if(event.createdBy && event.createdBy.id === userId && event.createdBy.pushToken)
      notificationRecipients.add(event.createdBy.pushToken);
    else
    {
      if (event.assignees) {
        event.assignees.forEach((assignee) => {
          if (assignee.id === userId && assignee.pushToken) {
            notificationRecipients.add(assignee.pushToken);
          }
        });
      }
    }
    const pushTokens = Array.from(notificationRecipients);
    if (pushTokens.length > 0) {
      await this.notificationService.sendEventUpdated(pushTokens, updatedEvent);
    }

    return this.formatEventResponse(updatedEvent);
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ["workspace", "assignees", "createdBy"],
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

    // Collect push tokens before deleting (exclude the user who deleted)
    const notificationRecipients = new Set<string>();

    // Add creator if not the one deleting
    if (event.createdBy && event.createdBy.id !== userId && event.createdBy.pushToken) {
      notificationRecipients.add(event.createdBy.pushToken);
    }

    // Add assignees (excluding the user who deleted)
    if (event.assignees) {
      event.assignees.forEach((assignee) => {
        if (assignee.id !== userId && assignee.pushToken) {
          notificationRecipients.add(assignee.pushToken);
        }
      });
    }

    // Store event name and calendarEventId before deleting
    const eventName = event.name;
    const calendarEventId = event.calendarEventId;

    // Cancel scheduled notification before deleting
    await cancelEventNotification(eventId);

    await this.eventRepository.remove(event);

    // Send deletion notification for calendar sync
    if(event.createdBy && event.createdBy.id === userId && event.createdBy.pushToken)
      notificationRecipients.add(event.createdBy.pushToken);
    else
    {
      if (event.assignees) {
        event.assignees.forEach((assignee) => {
          if (assignee.id === userId && assignee.pushToken) {
            notificationRecipients.add(assignee.pushToken);
          }
        });
      }
    }
    const pushTokens = Array.from(notificationRecipients);
    if (pushTokens.length > 0) {
      await this.notificationService.sendEventDeleted(pushTokens, eventId, eventName, calendarEventId);
    }
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
      recurrenceGroupId: event.recurrenceGroupId,
      tags: event.tags,
      metadata: event.metadata,
      calendarEventId: event.calendarEventId,
      workspaceId: event.workspaceId,
      createdById: event.createdById,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      assigneeIds: event.assignees?.map((assignee) => assignee.id),
    };
  }
}
