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
import { ProjectService } from "../services/project.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  AddProjectMembersDto,
  ReorderProjectsDto,
} from "../dtos/project.dto";
import { Project } from "../entities/project.entity";
import { ApiResponse, PaginatedResponse } from "../types/api-response.types";
import { getUserId } from "../utils/request.utils";

@Route("api/projects")
@Tags("Projects")
export class ProjectController extends Controller {
  private projectService = new ProjectService();

  /**
   * Create a new project
   * @summary Create a project
   * @example createProjectDto {
   *   "name": "My Project",
   *   "description": "Project description",
   *   "color": "#3B82F6",
   *   "icon": "📁",
   *   "isShared": false
   * }
   */
  @Post()
  @Security("jwt")
  @SuccessResponse("201", "Project created successfully")
  public async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Request() request: express.Request
  ): Promise<ApiResponse<Project>> {
    const userId = getUserId(request);

    const project = await this.projectService.createProject(
      userId,
      createProjectDto
    );

    this.setStatus(201);
    return {
      success: true,
      message: "Project created successfully",
      data: project,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get all projects with filtering and pagination
   * @summary List all projects
   */
  @Get()
  @Security("jwt")
  @SuccessResponse("200", "Projects retrieved successfully")
  public async getProjects(
    @Request() request: express.Request,
    @Query() page?: number,
    @Query() limit?: number,
    @Query() search?: string,
    @Query() isArchived?: boolean,
    @Query() isShared?: boolean,
    @Query() sortBy?: "name" | "createdAt" | "updatedAt" | "order",
    @Query() sortOrder?: "ASC" | "DESC"
  ): Promise<PaginatedResponse<Project[]>> {
    const userId = request.user!.userId;

    const query: ProjectQueryDto = {
      page: page || 1,
      limit: limit || 10,
      search,
      isArchived,
      isShared,
      sortBy,
      sortOrder,
    };

    const { projects, total } = await this.projectService.getProjects(
      userId,
      query
    );

    const currentPage = query.page || 1;
    const currentLimit = query.limit || 10;

    return {
      success: true,
      message: "Projects retrieved successfully",
      data: projects,
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
   * Get a single project by ID
   * @summary Get project by ID
   * @param id Project ID
   */
  @Get("{id}")
  @Security("jwt")
  @SuccessResponse("200", "Project retrieved successfully")
  public async getProjectById(
    @Path() id: string,
    @Request() request: express.Request
  ): Promise<ApiResponse<Project>> {
    const userId = request.user!.userId;

    const project = await this.projectService.getProjectById(id, userId);

    if (!project) {
      this.setStatus(404);
      throw new Error("Project not found");
    }

    return {
      success: true,
      message: "Project retrieved successfully",
      data: project,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update a project
   * @summary Update project
   * @param id Project ID
   * @example updateProjectDto {
   *   "name": "Updated Project Name",
   *   "description": "Updated description",
   *   "color": "#10B981"
   * }
   */
  @Put("{id}")
  @Security("jwt")
  @SuccessResponse("200", "Project updated successfully")
  public async updateProject(
    @Path() id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() request: express.Request
  ): Promise<ApiResponse<Project>> {
    const userId = request.user!.userId;

    try {
      const project = await this.projectService.updateProject(
        id,
        userId,
        updateProjectDto
      );

      if (!project) {
        this.setStatus(404);
        throw new Error("Project not found");
      }

      return {
        success: true,
        message: "Project updated successfully",
        data: project,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Only project owner")
      ) {
        this.setStatus(403);
        throw new Error(error.message);
      }
      throw error;
    }
  }

  /**
   * Delete a project
   * @summary Delete project
   * @param id Project ID
   */
  @Delete("{id}")
  @Security("jwt")
  @SuccessResponse("200", "Project deleted successfully")
  public async deleteProject(
    @Path() id: string,
    @Request() request: express.Request
  ): Promise<ApiResponse<null>> {
    const userId = request.user!.userId;

    try {
      const deleted = await this.projectService.deleteProject(id, userId);

      if (!deleted) {
        this.setStatus(404);
        throw new Error("Project not found");
      }

      return {
        success: true,
        message: "Project deleted successfully",
        data: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Only project owner")
      ) {
        this.setStatus(403);
        throw new Error(error.message);
      }
      throw error;
    }
  }

  /**
   * Add members to a project
   * @summary Add project members
   * @param id Project ID
   * @example addMembersDto {
   *   "userIds": ["123e4567-e89b-12d3-a456-426614174000"]
   * }
   */
  @Post("{id}/members")
  @Security("jwt")
  @SuccessResponse("200", "Members added successfully")
  public async addMembers(
    @Path() id: string,
    @Body() addMembersDto: AddProjectMembersDto,
    @Request() request: express.Request
  ): Promise<ApiResponse<Project>> {
    const userId = request.user!.userId;

    try {
      const project = await this.projectService.addMembers(
        id,
        userId,
        addMembersDto.userIds
      );

      if (!project) {
        this.setStatus(404);
        throw new Error("Project not found");
      }

      return {
        success: true,
        message: "Members added successfully",
        data: project,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Only project owner")
      ) {
        this.setStatus(403);
        throw new Error(error.message);
      }
      throw error;
    }
  }

  /**
   * Remove a member from a project
   * @summary Remove project member
   * @param id Project ID
   * @param userId User ID to remove
   */
  @Delete("{id}/members/{userId}")
  @Security("jwt")
  @SuccessResponse("200", "Member removed successfully")
  public async removeMember(
    @Path() id: string,
    @Path() userId: string,
    @Request() request: express.Request
  ): Promise<ApiResponse<Project>> {
    const currentUserId = request.user!.userId;

    try {
      const project = await this.projectService.removeMember(
        id,
        currentUserId,
        userId
      );

      if (!project) {
        this.setStatus(404);
        throw new Error("Project not found");
      }

      return {
        success: true,
        message: "Member removed successfully",
        data: project,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Only project owner")
      ) {
        this.setStatus(403);
        throw new Error(error.message);
      }
      throw error;
    }
  }

  /**
   * Reorder projects
   * @summary Reorder projects
   * @example reorderDto {
   *   "projectOrders": [
   *     { "id": "project-id-1", "order": 0 },
   *     { "id": "project-id-2", "order": 1 }
   *   ]
   * }
   */
  @Patch("reorder")
  @Security("jwt")
  @SuccessResponse("200", "Projects reordered successfully")
  public async reorderProjects(
    @Body() reorderDto: ReorderProjectsDto,
    @Request() request: express.Request
  ): Promise<ApiResponse<null>> {
    const userId = request.user!.userId;

    await this.projectService.reorderProjects(userId, reorderDto.projectOrders);

    return {
      success: true,
      message: "Projects reordered successfully",
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Archive or unarchive a project
   * @summary Toggle project archive status
   * @param id Project ID
   * @example archiveDto {
   *   "isArchived": true
   * }
   */
  @Patch("{id}/archive")
  @Security("jwt")
  @SuccessResponse("200", "Project archive status updated")
  public async toggleArchive(
    @Path() id: string,
    @Body() body: { isArchived: boolean },
    @Request() request: express.Request
  ): Promise<ApiResponse<Project>> {
    const userId = request.user!.userId;

    try {
      const project = await this.projectService.toggleArchive(
        id,
        userId,
        body.isArchived
      );

      if (!project) {
        this.setStatus(404);
        throw new Error("Project not found");
      }

      return {
        success: true,
        message: `Project ${
          body.isArchived ? "archived" : "unarchived"
        } successfully`,
        data: project,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Only project owner")
      ) {
        this.setStatus(403);
        throw new Error(error.message);
      }
      throw error;
    }
  }
}
