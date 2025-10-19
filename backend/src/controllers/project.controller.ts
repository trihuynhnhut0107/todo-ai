import { Request, Response } from "express";
import { BaseController } from "./base.controller";
import { ProjectService } from "../services/project.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  AddProjectMembersDto,
  RemoveProjectMemberDto,
  ReorderProjectsDto,
} from "../dtos/project.dto";

export class ProjectController extends BaseController {
  private projectService: ProjectService;

  constructor(projectService: ProjectService) {
    super();
    this.projectService = projectService;
  }

  /**
   * Create a new project
   * POST /api/projects
   */
  createProject = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const createProjectDto: CreateProjectDto = req.body;

    // Validate required fields
    if (!createProjectDto.name) {
      return this.sendValidationError(res, "Project name is required");
    }

    const project = await this.projectService.createProject(
      userId,
      createProjectDto
    );

    return this.sendSuccess(res, project, "Project created successfully", 201);
  });

  /**
   * Get all projects with filtering and pagination
   * GET /api/projects
   */
  getProjects = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const query: ProjectQueryDto = req.query;

    const { projects, total } = await this.projectService.getProjects(
      userId,
      query
    );

    const { page, limit } = this.getPaginationParams(req);
    const pagination = this.calculatePagination(page, limit, total);

    return this.sendPaginatedSuccess(
      res,
      projects,
      pagination,
      "Projects retrieved successfully"
    );
  });

  /**
   * Get a single project by ID
   * GET /api/projects/:id
   */
  getProjectById = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const project = await this.projectService.getProjectById(id, userId);

    if (!project) {
      return this.sendNotFound(res, "Project");
    }

    return this.sendSuccess(res, project, "Project retrieved successfully");
  });

  /**
   * Update a project
   * PUT /api/projects/:id
   */
  updateProject = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updateProjectDto: UpdateProjectDto = req.body;

    try {
      const project = await this.projectService.updateProject(
        id,
        userId,
        updateProjectDto
      );

      if (!project) {
        return this.sendNotFound(res, "Project");
      }

      return this.sendSuccess(res, project, "Project updated successfully");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Only project owner")
      ) {
        return this.sendForbidden(res, error.message);
      }
      throw error;
    }
  });

  /**
   * Delete a project
   * DELETE /api/projects/:id
   */
  deleteProject = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    try {
      const deleted = await this.projectService.deleteProject(id, userId);

      if (!deleted) {
        return this.sendNotFound(res, "Project");
      }

      return this.sendSuccess(res, null, "Project deleted successfully");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Only project owner")
      ) {
        return this.sendForbidden(res, error.message);
      }
      throw error;
    }
  });

  /**
   * Add members to a project
   * POST /api/projects/:id/members
   */
  addMembers = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { userIds }: AddProjectMembersDto = req.body;

    if (!userIds || userIds.length === 0) {
      return this.sendValidationError(res, "User IDs are required");
    }

    try {
      const project = await this.projectService.addMembers(id, userId, userIds);

      if (!project) {
        return this.sendNotFound(res, "Project");
      }

      return this.sendSuccess(res, project, "Members added successfully");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Only project owner")
      ) {
        return this.sendForbidden(res, error.message);
      }
      throw error;
    }
  });

  /**
   * Remove a member from a project
   * DELETE /api/projects/:id/members/:userId
   */
  removeMember = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id, userId: memberIdToRemove } = req.params;

    try {
      const project = await this.projectService.removeMember(
        id,
        userId,
        memberIdToRemove
      );

      if (!project) {
        return this.sendNotFound(res, "Project");
      }

      return this.sendSuccess(res, project, "Member removed successfully");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Only project owner")
      ) {
        return this.sendForbidden(res, error.message);
      }
      throw error;
    }
  });

  /**
   * Reorder projects
   * PATCH /api/projects/reorder
   */
  reorderProjects = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { projectOrders }: ReorderProjectsDto = req.body;

    if (!projectOrders || projectOrders.length === 0) {
      return this.sendValidationError(res, "Project orders are required");
    }

    await this.projectService.reorderProjects(userId, projectOrders);

    return this.sendSuccess(res, null, "Projects reordered successfully");
  });

  /**
   * Archive/unarchive a project
   * PATCH /api/projects/:id/archive
   */
  toggleArchive = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { isArchived } = req.body;

    if (isArchived === undefined) {
      return this.sendValidationError(res, "isArchived field is required");
    }

    try {
      const project = await this.projectService.toggleArchive(
        id,
        userId,
        isArchived
      );

      if (!project) {
        return this.sendNotFound(res, "Project");
      }

      return this.sendSuccess(
        res,
        project,
        `Project ${isArchived ? "archived" : "unarchived"} successfully`
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Only project owner")
      ) {
        return this.sendForbidden(res, error.message);
      }
      throw error;
    }
  });
}
