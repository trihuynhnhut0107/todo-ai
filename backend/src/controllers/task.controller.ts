import { Request, Response } from "express";
import { BaseController } from "./base.controller";
import { TaskService } from "../services/task.service";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  BulkUpdateTasksDto,
  ReorderTasksDto,
} from "../dtos/task.dto";

export class TaskController extends BaseController {
  private taskService: TaskService;

  constructor(taskService: TaskService) {
    super();
    this.taskService = taskService;
  }

  /**
   * Create a new task
   * POST /api/tasks
   */
  createTask = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const createTaskDto: CreateTaskDto = req.body;

    // Validate required fields
    if (!createTaskDto.title) {
      return this.sendValidationError(res, "Task title is required");
    }

    try {
      const task = await this.taskService.createTask(userId, createTaskDto);

      return this.sendSuccess(res, task, "Task created successfully", 201);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Project not found")
      ) {
        return this.sendNotFound(res, "Project");
      }
      if (error instanceof Error && error.message.includes("access denied")) {
        return this.sendForbidden(res, error.message);
      }
      throw error;
    }
  });

  /**
   * Get all tasks with filtering and pagination
   * GET /api/tasks
   */
  getTasks = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const query: TaskQueryDto = req.query;

    const { tasks, total } = await this.taskService.getTasks(userId, query);

    const { page, limit } = this.getPaginationParams(req);
    const pagination = this.calculatePagination(page, limit, total);

    return this.sendPaginatedSuccess(
      res,
      tasks,
      pagination,
      "Tasks retrieved successfully"
    );
  });

  /**
   * Get a single task by ID
   * GET /api/tasks/:id
   */
  getTaskById = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const task = await this.taskService.getTaskById(id, userId);

    if (!task) {
      return this.sendNotFound(res, "Task");
    }

    return this.sendSuccess(res, task, "Task retrieved successfully");
  });

  /**
   * Update a task
   * PUT /api/tasks/:id
   */
  updateTask = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updateTaskDto: UpdateTaskDto = req.body;

    try {
      const task = await this.taskService.updateTask(id, userId, updateTaskDto);

      if (!task) {
        return this.sendNotFound(res, "Task");
      }

      return this.sendSuccess(res, task, "Task updated successfully");
    } catch (error) {
      if (error instanceof Error && error.message.includes("Only task owner")) {
        return this.sendForbidden(res, error.message);
      }
      throw error;
    }
  });

  /**
   * Delete a task
   * DELETE /api/tasks/:id
   */
  deleteTask = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    try {
      const deleted = await this.taskService.deleteTask(id, userId);

      if (!deleted) {
        return this.sendNotFound(res, "Task");
      }

      return this.sendSuccess(res, null, "Task deleted successfully");
    } catch (error) {
      if (error instanceof Error && error.message.includes("Only task owner")) {
        return this.sendForbidden(res, error.message);
      }
      throw error;
    }
  });

  /**
   * Bulk update tasks
   * PATCH /api/tasks/bulk
   */
  bulkUpdateTasks = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const bulkUpdateDto: BulkUpdateTasksDto = req.body;

    if (!bulkUpdateDto.taskIds || bulkUpdateDto.taskIds.length === 0) {
      return this.sendValidationError(res, "Task IDs are required");
    }

    if (!bulkUpdateDto.updates) {
      return this.sendValidationError(res, "Updates are required");
    }

    const tasks = await this.taskService.bulkUpdateTasks(userId, bulkUpdateDto);

    return this.sendSuccess(res, tasks, "Tasks updated successfully");
  });

  /**
   * Reorder tasks
   * PATCH /api/tasks/reorder
   */
  reorderTasks = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { taskOrders }: ReorderTasksDto = req.body;

    if (!taskOrders || taskOrders.length === 0) {
      return this.sendValidationError(res, "Task orders are required");
    }

    await this.taskService.reorderTasks(userId, taskOrders);

    return this.sendSuccess(res, null, "Tasks reordered successfully");
  });

  /**
   * Get task statistics
   * GET /api/tasks/stats
   */
  getTaskStats = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const stats = await this.taskService.getTaskStats(userId);

    return this.sendSuccess(
      res,
      stats,
      "Task statistics retrieved successfully"
    );
  });

  /**
   * Get tasks by project
   * GET /api/projects/:projectId/tasks
   */
  getTasksByProject = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { projectId } = req.params;
    const query: TaskQueryDto = req.query;

    try {
      const { tasks, total } = await this.taskService.getTasksByProject(
        projectId,
        userId,
        query
      );

      const { page, limit } = this.getPaginationParams(req);
      const pagination = this.calculatePagination(page, limit, total);

      return this.sendPaginatedSuccess(
        res,
        tasks,
        pagination,
        "Tasks retrieved successfully"
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Project not found")
      ) {
        return this.sendNotFound(res, "Project");
      }
      if (error instanceof Error && error.message.includes("access denied")) {
        return this.sendForbidden(res, error.message);
      }
      throw error;
    }
  });
}
