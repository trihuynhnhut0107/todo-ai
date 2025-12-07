import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Request,
} from "tsoa";
import { WorkspaceService } from "../services/workspace.service";
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceResponse,
  AddWorkspaceMemberDto,
  RemoveWorkspaceMemberDto,
} from "../dtos/workspace.dto";
import { ApiResponse, ErrorResponse } from "../types/api-response.types";

@Route("api/workspaces")
@Tags("Workspaces")
@Security("jwt")
export class WorkspaceController extends Controller {
  private workspaceService = new WorkspaceService();

  /**
   * Create a new workspace
   * @summary Create a workspace
   * @param createDto Workspace creation details
   * @returns Newly created workspace
   */
  @Post()
  @SuccessResponse("201", "Workspace created successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async createWorkspace(
    @Body() createDto: CreateWorkspaceDto,
    @Request() request: Express.Request
  ): Promise<ApiResponse<WorkspaceResponse>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      if (!createDto.name) {
        this.setStatus(400);
        throw new Error("Workspace name is required");
      }

      const workspace = await this.workspaceService.createWorkspace(
        userId,
        createDto
      );

      this.setStatus(201);
      return {
        success: true,
        message: "Workspace created successfully",
        data: workspace,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (error instanceof Error) {
        this.setStatus(400);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Get all workspaces for the authenticated user
   * @summary Get user workspaces
   * @returns List of workspaces
   */
  @Get()
  @SuccessResponse("200", "Workspaces retrieved successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getUserWorkspaces(
    @Request() request: Express.Request
  ): Promise<ApiResponse<WorkspaceResponse[]>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      const workspaces = await this.workspaceService.getUserWorkspaces(userId);

      return {
        success: true,
        message: "Workspaces retrieved successfully",
        data: workspaces,
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
   * Get workspace by ID
   * @summary Get workspace details
   * @param workspaceId Workspace ID
   * @returns Workspace details
   */
  @Get("{workspaceId}")
  @SuccessResponse("200", "Workspace retrieved successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("404", "Workspace not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getWorkspaceById(
    @Path() workspaceId: string,
    @Request() request: Express.Request
  ): Promise<ApiResponse<WorkspaceResponse>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      const workspace = await this.workspaceService.getWorkspaceById(
        workspaceId,
        userId
      );

      return {
        success: true,
        message: "Workspace retrieved successfully",
        data: workspace,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (
        error instanceof Error &&
        error.message === "Workspace not found or access denied"
      ) {
        this.setStatus(404);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Update workspace
   * @summary Update workspace
   * @param workspaceId Workspace ID
   * @param updateDto Workspace update details
   * @returns Updated workspace
   */
  @Put("{workspaceId}")
  @SuccessResponse("200", "Workspace updated successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("404", "Workspace not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async updateWorkspace(
    @Path() workspaceId: string,
    @Body() updateDto: UpdateWorkspaceDto,
    @Request() request: Express.Request
  ): Promise<ApiResponse<WorkspaceResponse>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      const workspace = await this.workspaceService.updateWorkspace(
        workspaceId,
        userId,
        updateDto
      );

      return {
        success: true,
        message: "Workspace updated successfully",
        data: workspace,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (
        error instanceof Error &&
        error.message === "Workspace not found or access denied"
      ) {
        this.setStatus(404);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Delete workspace
   * @summary Delete workspace
   * @param workspaceId Workspace ID
   * @returns Success message
   */
  @Delete("{workspaceId}")
  @SuccessResponse("200", "Workspace deleted successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("404", "Workspace not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async deleteWorkspace(
    @Path() workspaceId: string,
    @Request() request: Express.Request
  ): Promise<ApiResponse<void>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      await this.workspaceService.deleteWorkspace(workspaceId, userId);

      return {
        success: true,
        message: "Workspace deleted successfully",
        data: undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (
        error instanceof Error &&
        error.message === "Workspace not found or access denied"
      ) {
        this.setStatus(404);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Add members to workspace
   * @summary Add workspace members
   * @param workspaceId Workspace ID
   * @param addMembersDto User IDs to add
   * @returns Updated workspace
   */
  @Post("{workspaceId}/members")
  @SuccessResponse("200", "Members added successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("404", "Workspace or users not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async addMembers(
    @Path() workspaceId: string,
    @Body() addMembersDto: AddWorkspaceMemberDto,
    @Request() request: Express.Request
  ): Promise<ApiResponse<WorkspaceResponse>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      if (!addMembersDto.userIds || addMembersDto.userIds.length === 0) {
        this.setStatus(400);
        throw new Error("User IDs are required");
      }

      const workspace = await this.workspaceService.addMembers(
        workspaceId,
        userId,
        addMembersDto.userIds
      );

      return {
        success: true,
        message: "Members added successfully",
        data: workspace,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (
        error instanceof Error &&
        (error.message === "Workspace not found or access denied" ||
          error.message === "One or more users not found")
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
   * Remove member from workspace
   * @summary Remove workspace member
   * @param workspaceId Workspace ID
   * @param removeMemberDto User ID to remove
   * @returns Updated workspace
   */
  @Delete("{workspaceId}/members")
  @SuccessResponse("200", "Member removed successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("404", "Workspace not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async removeMember(
    @Path() workspaceId: string,
    @Body() removeMemberDto: RemoveWorkspaceMemberDto,
    @Request() request: Express.Request
  ): Promise<ApiResponse<WorkspaceResponse>> {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      if (!removeMemberDto.userId) {
        this.setStatus(400);
        throw new Error("User ID is required");
      }

      const workspace = await this.workspaceService.removeMember(
        workspaceId,
        userId,
        removeMemberDto.userId
      );

      return {
        success: true,
        message: "Member removed successfully",
        data: workspace,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (
        error instanceof Error &&
        error.message === "Workspace not found or access denied"
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
   * Get workspace members
   * @summary Get workspace members
   * @param workspaceId Workspace ID
   * @returns List of workspace members
   */
  @Get("{workspaceId}/members")
  @SuccessResponse("200", "Members retrieved successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("403", "Access denied")
  @Response<ErrorResponse>("404", "Workspace not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getWorkspaceMembers(
    @Path() workspaceId: string,
    @Request() request: Express.Request
  ): Promise<
    ApiResponse<{ id: string; name: string; email: string; role: string }[]>
  > {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      // Check if user has access to this workspace
      const workspace = await this.workspaceService.getWorkspaceById(
        workspaceId,
        userId
      );

      if (!workspace) {
        this.setStatus(403);
        throw new Error("Access denied");
      }

      const members = await this.workspaceService.getWorkspaceMembers(
        workspaceId
      );

      return {
        success: true,
        message: "Members retrieved successfully",
        data: members,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else if (error instanceof Error && error.message === "Access denied") {
        this.setStatus(403);
      } else if (
        error instanceof Error &&
        (error.message === "Workspace not found or access denied" ||
          error.message === "Workspace not found")
      ) {
        this.setStatus(404);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }
}
