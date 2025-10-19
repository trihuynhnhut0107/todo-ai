import {
  Repository,
  FindOptionsWhere,
  ILike,
  In,
  LessThan,
  MoreThan,
} from "typeorm";
import { AppDataSource } from "../data-source";
import { Task, TaskStatus, TaskPriority } from "../entities/task.entity";
import { Project } from "../entities/project.entity";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  BulkUpdateTasksDto,
  TaskStatsDto,
} from "../dtos/task.dto";

export class TaskService {
  private taskRepository: Repository<Task>;
  private projectRepository: Repository<Project>;

  constructor() {
    this.taskRepository = AppDataSource.getRepository(Task);
    this.projectRepository = AppDataSource.getRepository(Project);
  }

  /**
   * Create a new task
   */
  async createTask(
    userId: string,
    createTaskDto: CreateTaskDto
  ): Promise<Task> {
    const { projectId, assignedToId, dueDate, ...taskData } = createTaskDto;

    // Verify project access if projectId is provided
    if (projectId) {
      const project = await this.projectRepository
        .createQueryBuilder("project")
        .leftJoinAndSelect("project.members", "members")
        .where("project.id = :projectId", { projectId })
        .andWhere("(project.ownerId = :userId OR members.id = :userId)", {
          userId,
        })
        .getOne();

      if (!project) {
        throw new Error("Project not found or access denied");
      }
    }

    // Create task
    const task = this.taskRepository.create({
      ...taskData,
      userId,
      projectId: projectId || undefined,
      assignedToId: assignedToId || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return await this.taskRepository.save(task);
  }

  /**
   * Get all tasks for a user with filtering and pagination
   */
  async getTasks(
    userId: string,
    query: TaskQueryDto
  ): Promise<{ tasks: Task[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      projectId,
      assignedToId,
      dueBefore,
      dueAfter,
      tags,
      sortBy = "order",
      sortOrder = "ASC",
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.user", "user")
      .leftJoinAndSelect("task.project", "project")
      .leftJoinAndSelect("task.assignedTo", "assignedTo")
      .where("(task.userId = :userId OR task.assignedToId = :userId)", {
        userId,
      });

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        "(task.title ILIKE :search OR task.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere("task.status = :status", { status });
    }

    if (priority) {
      queryBuilder.andWhere("task.priority = :priority", { priority });
    }

    if (projectId) {
      queryBuilder.andWhere("task.projectId = :projectId", { projectId });
    }

    if (assignedToId) {
      queryBuilder.andWhere("task.assignedToId = :assignedToId", {
        assignedToId,
      });
    }

    if (dueBefore) {
      queryBuilder.andWhere("task.dueDate < :dueBefore", {
        dueBefore: new Date(dueBefore),
      });
    }

    if (dueAfter) {
      queryBuilder.andWhere("task.dueDate > :dueAfter", {
        dueAfter: new Date(dueAfter),
      });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere("task.tags && :tags", { tags });
    }

    // Apply sorting
    queryBuilder.orderBy(`task.${sortBy}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const tasks = await queryBuilder.skip(skip).take(limit).getMany();

    return { tasks, total };
  }

  /**
   * Get a single task by ID
   */
  async getTaskById(taskId: string, userId: string): Promise<Task | null> {
    const task = await this.taskRepository.findOne({
      where: [
        { id: taskId, userId },
        { id: taskId, assignedToId: userId },
      ],
      relations: ["user", "project", "assignedTo"],
    });

    return task;
  }

  /**
   * Update a task
   */
  async updateTask(
    taskId: string,
    userId: string,
    updateTaskDto: UpdateTaskDto
  ): Promise<Task | null> {
    const task = await this.getTaskById(taskId, userId);

    if (!task) {
      return null;
    }

    // Parse date fields if provided
    const updates = { ...updateTaskDto };
    if (updates.dueDate) {
      updates.dueDate = new Date(updates.dueDate as string);
    }
    if (updates.completedAt) {
      updates.completedAt = new Date(updates.completedAt as string);
    }

    // Auto-set completedAt when status changes to completed
    if (updates.status === TaskStatus.COMPLETED && !task.completedAt) {
      updates.completedAt = new Date();
    }

    // Clear completedAt when status changes from completed
    if (
      updates.status &&
      updates.status !== TaskStatus.COMPLETED &&
      task.completedAt
    ) {
      updates.completedAt = null;
    }

    Object.assign(task, updates);

    return await this.taskRepository.save(task);
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    const task = await this.getTaskById(taskId, userId);

    if (!task) {
      return false;
    }

    // Only task owner can delete
    if (task.userId !== userId) {
      throw new Error("Only task owner can delete task");
    }

    await this.taskRepository.remove(task);
    return true;
  }

  /**
   * Bulk update tasks
   */
  async bulkUpdateTasks(
    userId: string,
    bulkUpdateDto: BulkUpdateTasksDto
  ): Promise<Task[]> {
    const { taskIds, updates } = bulkUpdateDto;

    const tasks = await this.taskRepository.find({
      where: [
        { id: In(taskIds), userId },
        { id: In(taskIds), assignedToId: userId },
      ],
    });

    if (tasks.length === 0) {
      return [];
    }

    // Apply updates to all tasks
    for (const task of tasks) {
      Object.assign(task, updates);

      // Auto-set completedAt when status changes to completed
      if (updates.status === TaskStatus.COMPLETED && !task.completedAt) {
        task.completedAt = new Date();
      }
    }

    return await this.taskRepository.save(tasks);
  }

  /**
   * Reorder tasks
   */
  async reorderTasks(
    userId: string,
    taskOrders: Array<{ id: string; order: number }>
  ): Promise<void> {
    const taskIds = taskOrders.map((to) => to.id);

    const tasks = await this.taskRepository.find({
      where: [
        { id: In(taskIds), userId },
        { id: In(taskIds), assignedToId: userId },
      ],
    });

    // Update orders
    for (const task of tasks) {
      const newOrder = taskOrders.find((to) => to.id === task.id)?.order;
      if (newOrder !== undefined) {
        task.order = newOrder;
      }
    }

    await this.taskRepository.save(tasks);
  }

  /**
   * Get task statistics
   */
  async getTaskStats(userId: string): Promise<TaskStatsDto> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .where("(task.userId = :userId OR task.assignedToId = :userId)", {
        userId,
      });

    const total = await queryBuilder.getCount();

    const pending = await queryBuilder
      .clone()
      .andWhere("task.status = :status", { status: TaskStatus.PENDING })
      .getCount();

    const inProgress = await queryBuilder
      .clone()
      .andWhere("task.status = :status", { status: TaskStatus.IN_PROGRESS })
      .getCount();

    const completed = await queryBuilder
      .clone()
      .andWhere("task.status = :status", { status: TaskStatus.COMPLETED })
      .getCount();

    const cancelled = await queryBuilder
      .clone()
      .andWhere("task.status = :status", { status: TaskStatus.CANCELLED })
      .getCount();

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const overdue = await queryBuilder
      .clone()
      .andWhere("task.dueDate < :now", { now: startOfToday })
      .andWhere("task.status != :completed", {
        completed: TaskStatus.COMPLETED,
      })
      .getCount();

    const dueToday = await queryBuilder
      .clone()
      .andWhere("task.dueDate >= :start", { start: startOfToday })
      .andWhere("task.dueDate <= :end", { end: endOfToday })
      .andWhere("task.status != :completed", {
        completed: TaskStatus.COMPLETED,
      })
      .getCount();

    const dueSoon = await queryBuilder
      .clone()
      .andWhere("task.dueDate > :now", { now: endOfToday })
      .andWhere("task.dueDate <= :nextWeek", { nextWeek })
      .andWhere("task.status != :completed", {
        completed: TaskStatus.COMPLETED,
      })
      .getCount();

    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled,
      overdue,
      dueToday,
      dueSoon,
    };
  }

  /**
   * Get tasks by project
   */
  async getTasksByProject(
    projectId: string,
    userId: string,
    query: TaskQueryDto
  ): Promise<{ tasks: Task[]; total: number }> {
    // Verify project access
    const project = await this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.members", "members")
      .where("project.id = :projectId", { projectId })
      .andWhere("(project.ownerId = :userId OR members.id = :userId)", {
        userId,
      })
      .getOne();

    if (!project) {
      throw new Error("Project not found or access denied");
    }

    return await this.getTasks(userId, { ...query, projectId });
  }
}
