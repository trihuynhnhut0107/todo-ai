import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Put,
  Query,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Request,
} from "tsoa";
import * as express from "express";
import { TaskService } from "../services/task.service";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  BulkUpdateTasksDto,
  ReorderTasksDto,
  TaskStatsDto,
} from "../dtos/task.dto";
import { Task, TaskStatus, TaskPriority } from "../entities/task.entity";
import { ApiResponse, PaginatedResponse } from "../types/api-response.types";

@Route("api/tasks")
@Tags("Tasks")
export class TaskController extends Controller {
  private taskService = new TaskService();

  /**
   * Create a new task
   * @summary Create a task
   * @example createTaskDto {
   *   "title": "Complete project documentation",
   *   "description": "Write comprehensive docs",
   *   "status": "pending",
   *   "priority": "high",
   *   "dueDate": "2025-10-25T10:00:00Z",
   *   "projectId": "123e4567-e89b-12d3-a456-426614174000",
   *   "tags": ["documentation", "priority"]
   * }
   */
  @Post()
  @Security("jwt")
  @SuccessResponse("201", "Task created successfully")
  public async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Request() request: express.Request
  ): Promise<ApiResponse<Task>> {
    const userId = (request.user as any).userId;

    try {
      const task = await this.taskService.createTask(userId, createTaskDto);

      this.setStatus(201);
      return {
        success: true,
        message: "Task created successfully",
        data: task,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Project not found")
      ) {
        this.setStatus(404);
        throw new Error("Project not found");
      }
      if (error instanceof Error && error.message.includes("access denied")) {
        this.setStatus(403);
        throw new Error(error.message);
      }
      throw error;
    }
  }

  /**
   * Get all tasks with filtering and pagination
   * @summary List all tasks
   */
  @Get()
  @Security("jwt")
  @SuccessResponse("200", "Tasks retrieved successfully")
  public async getTasks(
    @Request() request: express.Request,
    @Query() page?: number,
    @Query() limit?: number,
    @Query() search?: string,
    @Query() status?: TaskStatus,
    @Query() priority?: TaskPriority,
    @Query() projectId?: string,
    @Query() assignedToId?: string,
    @Query() dueBefore?: string,
    @Query() dueAfter?: string,
    @Query() tags?: string[],
    @Query()
    sortBy?:
      | "title"
      | "createdAt"
      | "updatedAt"
      | "dueDate"
      | "priority"
      | "order",
    @Query() sortOrder?: "ASC" | "DESC"
  ): Promise<PaginatedResponse<Task[]>> {
    const userId = (request.user as any).userId;

    const query: TaskQueryDto = {
      page: page || 1,
      limit: limit || 10,
      search,
      status,
      priority,
      projectId,
      assignedToId,
      dueBefore,
      dueAfter,
      tags,
      sortBy,
      sortOrder,
    };

    const { tasks, total } = await this.taskService.getTasks(userId, query);

    const currentPage = query.page || 1;
    const currentLimit = query.limit || 10;

    return {
      success: true,
      message: "Tasks retrieved successfully",
      data: tasks,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get task statistics
   * @summary Get task statistics
   */
  @Get("stats")
  @Security("jwt")
  @SuccessResponse("200", "Task statistics retrieved successfully")
  public async getTaskStats(
    @Request() request: express.Request
  ): Promise<ApiResponse<TaskStatsDto>> {
    const userId = (request.user as any).userId;

    const stats = await this.taskService.getTaskStats(userId);

    return {
      success: true,
      message: "Task statistics retrieved successfully",
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get a single task by ID
   * @summary Get task by ID
   * @param id Task ID
   */
  @Get("{id}")
  @Security("jwt")
  @SuccessResponse("200", "Task retrieved successfully")
  public async getTaskById(
    @Path() id: string,
    @Request() request: express.Request
  ): Promise<ApiResponse<Task>> {
    const userId = (request.user as any).userId;

    const task = await this.taskService.getTaskById(id, userId);

    if (!task) {
      this.setStatus(404);
      throw new Error("Task not found");
    }

    return {
      success: true,
      message: "Task retrieved successfully",
      data: task,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update a task
   * @summary Update task
   * @param id Task ID
   * @example updateTaskDto {
   *   "title": "Updated task title",
   *   "status": "in_progress",
   *   "priority": "urgent"
   * }
   */
  @Put("{id}")
  @Security("jwt")
  @SuccessResponse("200", "Task updated successfully")
  public async updateTask(
    @Path() id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() request: express.Request
  ): Promise<ApiResponse<Task>> {
    const userId = (request.user as any).userId;

    try {
      const task = await this.taskService.updateTask(id, userId, updateTaskDto);

      if (!task) {
        this.setStatus(404);
        throw new Error("Task not found");
      }

      return {
        success: true,
        message: "Task updated successfully",
        data: task,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("Only task owner")) {
        this.setStatus(403);
        throw new Error(error.message);
      }
      throw error;
    }
  }

  /**
   * Delete a task
   * @summary Delete task
   * @param id Task ID
   */
  @Delete("{id}")
  @Security("jwt")
  @SuccessResponse("200", "Task deleted successfully")
  public async deleteTask(
    @Path() id: string,
    @Request() request: express.Request
  ): Promise<ApiResponse<null>> {
    const userId = (request.user as any).userId;

    try {
      const deleted = await this.taskService.deleteTask(id, userId);

      if (!deleted) {
        this.setStatus(404);
        throw new Error("Task not found");
      }

      return {
        success: true,
        message: "Task deleted successfully",
        data: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("Only task owner")) {
        this.setStatus(403);
        throw new Error(error.message);
      }
      throw error;
    }
  }

  /**
   * Bulk update tasks
   * @summary Bulk update multiple tasks
   * @example bulkUpdateDto {
   *   "taskIds": ["task-id-1", "task-id-2"],
   *   "updates": {
   *     "status": "completed",
   *     "priority": "low"
   *   }
   * }
   */
  @Patch("bulk")
  @Security("jwt")
  @SuccessResponse("200", "Tasks updated successfully")
  public async bulkUpdateTasks(
    @Body() bulkUpdateDto: BulkUpdateTasksDto,
    @Request() request: express.Request
  ): Promise<ApiResponse<Task[]>> {
    const userId = (request.user as any).userId;

    const tasks = await this.taskService.bulkUpdateTasks(userId, bulkUpdateDto);

    return {
      success: true,
      message: "Tasks updated successfully",
      data: tasks,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reorder tasks
   * @summary Reorder tasks
   * @example reorderDto {
   *   "taskOrders": [
   *     { "id": "task-id-1", "order": 0 },
   *     { "id": "task-id-2", "order": 1 }
   *   ]
   * }
   */
  @Patch("reorder")
  @Security("jwt")
  @SuccessResponse("200", "Tasks reordered successfully")
  public async reorderTasks(
    @Body() reorderDto: ReorderTasksDto,
    @Request() request: express.Request
  ): Promise<ApiResponse<null>> {
    const userId = (request.user as any).userId;

    await this.taskService.reorderTasks(userId, reorderDto.taskOrders);

    return {
      success: true,
      message: "Tasks reordered successfully",
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}

@Route("projects/{projectId}/tasks")
@Tags("Tasks")
export class ProjectTaskController extends Controller {
  private taskService = new TaskService();

  /**
   * Get tasks by project
   * @summary Get all tasks in a project
   * @param projectId Project ID
   */
  @Get()
  @Security("jwt")
  @SuccessResponse("200", "Tasks retrieved successfully")
  public async getTasksByProject(
    @Path() projectId: string,
    @Request() request: express.Request,
    @Query() page?: number,
    @Query() limit?: number,
    @Query() search?: string,
    @Query() status?: TaskStatus,
    @Query() priority?: TaskPriority,
    @Query() assignedToId?: string,
    @Query() dueBefore?: string,
    @Query() dueAfter?: string,
    @Query() tags?: string[],
    @Query()
    sortBy?:
      | "title"
      | "createdAt"
      | "updatedAt"
      | "dueDate"
      | "priority"
      | "order",
    @Query() sortOrder?: "ASC" | "DESC"
  ): Promise<PaginatedResponse<Task[]>> {
    const userId = (request.user as any).userId;

    const query: TaskQueryDto = {
      page: page || 1,
      limit: limit || 10,
      search,
      status,
      priority,
      assignedToId,
      dueBefore,
      dueAfter,
      tags,
      sortBy,
      sortOrder,
    };

    try {
      const { tasks, total } = await this.taskService.getTasksByProject(
        projectId,
        userId,
        query
      );

      const currentPage = query.page || 1;
      const currentLimit = query.limit || 10;

      return {
        success: true,
        message: "Tasks retrieved successfully",
        data: tasks,
        pagination: {
          page: currentPage,
          limit: currentLimit,
          total,
          totalPages: Math.ceil(total / currentLimit),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Project not found")
      ) {
        this.setStatus(404);
        throw new Error("Project not found");
      }
      if (error instanceof Error && error.message.includes("access denied")) {
        this.setStatus(403);
        throw new Error(error.message);
      }
      throw error;
    }
  }
}
