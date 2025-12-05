import { AppDataSource } from "../data-source";
import { Workspace } from "../entities/workspace.entity";
import { User } from "../entities/user.entity";
import { In } from "typeorm";
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceResponse,
} from "../dtos/workspace.dto";

export class WorkspaceService {
  private workspaceRepository = AppDataSource.getRepository(Workspace);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Create a new workspace
   */
  async createWorkspace(
    userId: string,
    createDto: CreateWorkspaceDto
  ): Promise<WorkspaceResponse> {
    const workspace = this.workspaceRepository.create({
      ...createDto,
      ownerId: userId,
      timezoneCode: createDto.timezoneCode || "UTC",
    });

    const savedWorkspace = await this.workspaceRepository.save(workspace);

    return this.formatWorkspaceResponse(savedWorkspace);
  }

  /**
   * Get all workspaces for a user (owned or member)
   */
  async getUserWorkspaces(userId: string): Promise<WorkspaceResponse[]> {
    const workspaces = await this.workspaceRepository
      .createQueryBuilder("workspace")
      .leftJoinAndSelect("workspace.members", "member")
      .leftJoinAndSelect("workspace.events", "event")
      .where("workspace.ownerId = :userId", { userId })
      .orWhere("member.id = :userId", { userId })
      .orderBy("workspace.order", "ASC")
      .addOrderBy("workspace.createdAt", "DESC")
      .getMany();

    return workspaces.map((workspace) =>
      this.formatWorkspaceResponse(workspace)
    );
  }

  /**
   * Get workspace by ID
   */
  async getWorkspaceById(
    workspaceId: string,
    userId: string
  ): Promise<WorkspaceResponse> {
    const workspace = await this.workspaceRepository
      .createQueryBuilder("workspace")
      .leftJoinAndSelect("workspace.members", "member")
      .leftJoinAndSelect("workspace.events", "event")
      .where("workspace.id = :workspaceId", { workspaceId })
      .andWhere("(workspace.ownerId = :userId OR member.id = :userId)", {
        userId,
      })
      .getOne();

    if (!workspace) {
      throw new Error("Workspace not found or access denied");
    }

    return this.formatWorkspaceResponse(workspace);
  }

  /**
   * Update workspace
   */
  async updateWorkspace(
    workspaceId: string,
    userId: string,
    updateDto: UpdateWorkspaceDto
  ): Promise<WorkspaceResponse> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId, ownerId: userId },
    });

    if (!workspace) {
      throw new Error("Workspace not found or access denied");
    }

    Object.assign(workspace, updateDto);
    const updatedWorkspace = await this.workspaceRepository.save(workspace);

    return this.formatWorkspaceResponse(updatedWorkspace);
  }

  /**
   * Delete workspace
   */
  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId, ownerId: userId },
    });

    if (!workspace) {
      throw new Error("Workspace not found or access denied");
    }

    await this.workspaceRepository.remove(workspace);
  }

  /**
   * Add members to workspace
   */
  async addMembers(
    workspaceId: string,
    userId: string,
    userIds: string[]
  ): Promise<WorkspaceResponse> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId, ownerId: userId },
      relations: ["members"],
    });

    if (!workspace) {
      throw new Error("Workspace not found or access denied");
    }

    const users = await this.userRepository.findBy({
      id: In(userIds),
    });

    if (users.length !== userIds.length) {
      throw new Error("One or more users not found");
    }

    // Add only new members (avoid duplicates)
    const existingMemberIds = new Set(
      workspace.members?.map((m) => m.id) || []
    );
    const newMembers = users.filter((u) => !existingMemberIds.has(u.id));

    workspace.members = [...(workspace.members || []), ...newMembers];
    const updatedWorkspace = await this.workspaceRepository.save(workspace);

    return this.formatWorkspaceResponse(updatedWorkspace);
  }

  /**
   * Remove member from workspace
   */
  async removeMember(
    workspaceId: string,
    userId: string,
    memberIdToRemove: string
  ): Promise<WorkspaceResponse> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId, ownerId: userId },
      relations: ["members"],
    });

    if (!workspace) {
      throw new Error("Workspace not found or access denied");
    }

    workspace.members =
      workspace.members?.filter((m) => m.id !== memberIdToRemove) || [];
    const updatedWorkspace = await this.workspaceRepository.save(workspace);

    return this.formatWorkspaceResponse(updatedWorkspace);
  }

  /**
   * Get workspace members
   */
  async getWorkspaceMembers(
    workspaceId: string,
    userId: string
  ): Promise<{ id: string; name: string; email: string; role: string }[]> {
    const workspace = await this.workspaceRepository
      .createQueryBuilder("workspace")
      .leftJoinAndSelect("workspace.members", "member")
      .leftJoinAndSelect("workspace.owner", "owner")
      .where("workspace.id = :workspaceId", { workspaceId })
      .andWhere("(workspace.ownerId = :userId OR member.id = :userId)", {
        userId,
      })
      .getOne();

    if (!workspace) {
      throw new Error("Workspace not found or access denied");
    }

    const members = workspace.members || [];
    members.push(workspace.owner);
    return members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
    }));
  }

  /**
   * Format workspace response
   */
  private formatWorkspaceResponse(workspace: Workspace): WorkspaceResponse {
    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      timezoneCode: workspace.timezoneCode,
      color: workspace.color,
      icon: workspace.icon,
      isArchived: workspace.isArchived,
      metadata: workspace.metadata,
      ownerId: workspace.ownerId,
      order: workspace.order,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      memberCount: workspace.members?.length,
      eventCount: workspace.events?.length,
    };
  }
}
