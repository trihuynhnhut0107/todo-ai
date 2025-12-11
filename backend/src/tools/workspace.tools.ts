import { tool } from "langchain";
import { z } from "zod";
import { WorkspaceService } from "../services/workspace.service";

/**
 * LangChain tools for Workspace operations
 * Each tool wraps a corresponding WorkspaceService method for AI agent usage
 */

const workspaceService = new WorkspaceService();

/**
 * Tool: Create Workspace
 * Creates a new workspace for organizing events and team members
 */
export const createWorkspaceTool = tool(
  async (input) => {
    try {
      const result = await workspaceService.createWorkspace(input.userId, {
        name: input.name,
        description: input.description,
        timezoneCode: input.timezoneCode,
        color: input.color,
        icon: input.icon,
      });
      return JSON.stringify({
        success: true,
        workspace: result,
        message: `Workspace "${result.name}" created successfully`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "create_workspace",
    description:
      "Create a new workspace for organizing events and team members. A workspace acts as a container for events and allows multiple users to collaborate.",
    schema: z.object({
      userId: z.string().describe("The ID of the user creating the workspace"),
      name: z.string().describe("The name of the workspace"),
      description: z
        .string()
        .optional()
        .describe("Optional description of the workspace"),
      timezoneCode: z
        .string()
        .optional()
        .describe("Optional timezone code (e.g., 'UTC', 'America/New_York')"),
      color: z
        .string()
        .optional()
        .describe("Optional color code for the workspace (e.g., '#3B82F6')"),
      icon: z
        .string()
        .optional()
        .describe("Optional emoji or icon for the workspace"),
    }),
  }
);

/**
 * Tool: Get User Workspaces
 * Retrieves all workspaces owned by or member of the user
 */
export const getUserWorkspacesTool = tool(
  async (input) => {
    try {
      const result = await workspaceService.getUserWorkspaces(input.userId);
      return JSON.stringify({
        success: true,
        workspaces: result,
        count: result.length,
        message: `Found ${result.length} workspace(s)`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "get_user_workspaces",
    description:
      "Retrieve all workspaces owned by or member of the user. Use this to list available workspaces or find a specific workspace.",
    schema: z.object({
      userId: z.string().describe("The ID of the user"),
    }),
  }
);

/**
 * Tool: Get Workspace by ID
 * Retrieves detailed information about a specific workspace
 */
export const getWorkspaceByIdTool = tool(
  async (input) => {
    try {
      const result = await workspaceService.getWorkspaceById(
        input.workspaceId,
        input.userId
      );
      return JSON.stringify({
        success: true,
        workspace: result,
        message: `Workspace "${result.name}" retrieved successfully`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "get_workspace_by_id",
    description:
      "Retrieve detailed information about a specific workspace including members and events.",
    schema: z.object({
      userId: z.string().describe("The ID of the user requesting the workspace"),
      workspaceId: z.string().describe("The ID of the workspace to retrieve"),
    }),
  }
);

/**
 * Tool: Update Workspace
 * Updates workspace properties like name, description, color, and settings
 */
export const updateWorkspaceTool = tool(
  async (input) => {
    try {
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.timezoneCode !== undefined)
        updateData.timezoneCode = input.timezoneCode;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.icon !== undefined) updateData.icon = input.icon;
      if (input.isArchived !== undefined)
        updateData.isArchived = input.isArchived;

      const result = await workspaceService.updateWorkspace(
        input.workspaceId,
        input.userId,
        updateData
      );
      return JSON.stringify({
        success: true,
        workspace: result,
        message: `Workspace "${result.name}" updated successfully`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "update_workspace",
    description:
      "Update workspace properties. Only the workspace owner can update. Use this to rename, change description, update timezone, or modify visual settings.",
    schema: z.object({
      userId: z.string().describe("The ID of the user updating the workspace"),
      workspaceId: z.string().describe("The ID of the workspace to update"),
      name: z.string().optional().describe("Updated workspace name"),
      description: z.string().optional().describe("Updated description"),
      timezoneCode: z
        .string()
        .optional()
        .describe("Updated timezone code"),
      color: z.string().optional().describe("Updated color code"),
      icon: z.string().optional().describe("Updated icon/emoji"),
      isArchived: z
        .boolean()
        .optional()
        .describe("Archive or unarchive the workspace"),
    }),
  }
);

/**
 * Tool: Delete Workspace
 * Deletes a workspace permanently
 */
export const deleteWorkspaceTool = tool(
  async (input) => {
    try {
      await workspaceService.deleteWorkspace(input.workspaceId, input.userId);
      return JSON.stringify({
        success: true,
        message: "Workspace deleted successfully",
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "delete_workspace",
    description:
      "Permanently delete a workspace. Only the workspace owner can delete. This action cannot be undone and will remove all events in the workspace.",
    schema: z.object({
      userId: z.string().describe("The ID of the user deleting the workspace"),
      workspaceId: z.string().describe("The ID of the workspace to delete"),
    }),
  }
);

/**
 * Tool: Add Members to Workspace
 * Adds one or more users to a workspace as members
 */
export const addWorkspaceMembersTool = tool(
  async (input) => {
    try {
      const result = await workspaceService.addMembers(
        input.workspaceId,
        input.userId,
        input.userIds
      );
      return JSON.stringify({
        success: true,
        workspace: result,
        message: `Added ${input.userIds.length} member(s) to workspace "${result.name}"`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "add_workspace_members",
    description:
      "Add one or more users to a workspace as members. Only the workspace owner can add members. Use this to invite team members to collaborate.",
    schema: z.object({
      userId: z.string().describe("The ID of the user adding members (must be owner)"),
      workspaceId: z.string().describe("The ID of the workspace"),
      userIds: z
        .array(z.string())
        .describe("Array of user IDs to add as members"),
    }),
  }
);

/**
 * Tool: Remove Workspace Member
 * Removes a user from a workspace
 */
export const removeWorkspaceMemberTool = tool(
  async (input) => {
    try {
      const result = await workspaceService.removeMember(
        input.workspaceId,
        input.userId,
        input.memberIdToRemove
      );
      return JSON.stringify({
        success: true,
        workspace: result,
        message: `Removed member from workspace "${result.name}"`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "remove_workspace_member",
    description:
      "Remove a user from a workspace. Only the workspace owner can remove members.",
    schema: z.object({
      userId: z.string().describe("The ID of the user removing the member (must be owner)"),
      workspaceId: z.string().describe("The ID of the workspace"),
      memberIdToRemove: z.string().describe("The ID of the member to remove"),
    }),
  }
);

/**
 * Tool: Get Workspace Members
 * Retrieves all members of a workspace with their details
 */
export const getWorkspaceMembersTool = tool(
  async (input) => {
    try {
      const result = await workspaceService.getWorkspaceMembers(
        input.workspaceId
      );
      return JSON.stringify({
        success: true,
        members: result,
        count: result.length,
        message: `Found ${result.length} member(s) in workspace`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  {
    name: "get_workspace_members",
    description:
      "Retrieve all members of a workspace with their details (name, email, role). Use this to see who has access to the workspace.",
    schema: z.object({
      userId: z.string().describe("The ID of the user requesting members"),
      workspaceId: z.string().describe("The ID of the workspace"),
    }),
  }
);

/**
 * Export all workspace tools as an array for easy registration
 */
export const workspaceTools = [
  createWorkspaceTool,
  getUserWorkspacesTool,
  getWorkspaceByIdTool,
  updateWorkspaceTool,
  deleteWorkspaceTool,
  addWorkspaceMembersTool,
  removeWorkspaceMemberTool,
  getWorkspaceMembersTool,
];
