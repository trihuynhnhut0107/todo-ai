import { Repository, FindOptionsWhere, ILike, In } from "typeorm";
import { AppDataSource } from "../data-source";
import { Project } from "../entities/project.entity";
import { User } from "../entities/user.entity";
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
} from "../dtos/project.dto";

export class ProjectService {
  private projectRepository: Repository<Project>;
  private userRepository: Repository<User>;

  constructor() {
    this.projectRepository = AppDataSource.getRepository(Project);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Create a new project
   */
  async createProject(
    userId: string,
    createProjectDto: CreateProjectDto
  ): Promise<Project> {
    const { memberIds, ...projectData } = createProjectDto;

    // Create project
    const project = this.projectRepository.create({
      ...projectData,
      ownerId: userId,
    });

    // Add members if provided
    if (memberIds && memberIds.length > 0) {
      const members = await this.userRepository.findBy({
        id: In(memberIds),
      });
      project.members = members;
    }

    return await this.projectRepository.save(project);
  }

  /**
   * Get all projects for a user with filtering and pagination
   */
  async getProjects(
    userId: string,
    query: ProjectQueryDto
  ): Promise<{ projects: Project[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      isArchived,
      isShared,
      sortBy = "order",
      sortOrder = "ASC",
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.owner", "owner")
      .leftJoinAndSelect("project.members", "members")
      .leftJoinAndSelect("project.tasks", "tasks")
      .where("(project.ownerId = :userId OR members.id = :userId)", { userId });

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        "(project.name ILIKE :search OR project.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (isArchived !== undefined) {
      queryBuilder.andWhere("project.isArchived = :isArchived", { isArchived });
    }

    if (isShared !== undefined) {
      queryBuilder.andWhere("project.isShared = :isShared", { isShared });
    }

    // Apply sorting
    queryBuilder.orderBy(`project.${sortBy}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const projects = await queryBuilder.skip(skip).take(limit).getMany();

    return { projects, total };
  }

  /**
   * Get a single project by ID
   */
  async getProjectById(
    projectId: string,
    userId: string
  ): Promise<Project | null> {
    const project = await this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.owner", "owner")
      .leftJoinAndSelect("project.members", "members")
      .leftJoinAndSelect("project.tasks", "tasks")
      .where("project.id = :projectId", { projectId })
      .andWhere("(project.ownerId = :userId OR members.id = :userId)", {
        userId,
      })
      .getOne();

    return project;
  }

  /**
   * Update a project
   */
  async updateProject(
    projectId: string,
    userId: string,
    updateProjectDto: UpdateProjectDto
  ): Promise<Project | null> {
    const project = await this.getProjectById(projectId, userId);

    if (!project) {
      return null;
    }

    // Only owner can update
    if (project.ownerId !== userId) {
      throw new Error("Only project owner can update project");
    }

    Object.assign(project, updateProjectDto);

    return await this.projectRepository.save(project);
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    const project = await this.getProjectById(projectId, userId);

    if (!project) {
      return false;
    }

    // Only owner can delete
    if (project.ownerId !== userId) {
      throw new Error("Only project owner can delete project");
    }

    await this.projectRepository.remove(project);
    return true;
  }

  /**
   * Add members to a project
   */
  async addMembers(
    projectId: string,
    userId: string,
    userIds: string[]
  ): Promise<Project | null> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ["members"],
    });

    if (!project) {
      return null;
    }

    // Only owner can add members
    if (project.ownerId !== userId) {
      throw new Error("Only project owner can add members");
    }

    const newMembers = await this.userRepository.findBy({
      id: In(userIds),
    });

    // Merge existing and new members (avoid duplicates)
    const existingMemberIds = new Set(project.members?.map((m) => m.id) || []);
    const membersToAdd = newMembers.filter((m) => !existingMemberIds.has(m.id));

    project.members = [...(project.members || []), ...membersToAdd];

    return await this.projectRepository.save(project);
  }

  /**
   * Remove a member from a project
   */
  async removeMember(
    projectId: string,
    userId: string,
    memberIdToRemove: string
  ): Promise<Project | null> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ["members"],
    });

    if (!project) {
      return null;
    }

    // Only owner can remove members
    if (project.ownerId !== userId) {
      throw new Error("Only project owner can remove members");
    }

    project.members =
      project.members?.filter((m) => m.id !== memberIdToRemove) || [];

    return await this.projectRepository.save(project);
  }

  /**
   * Reorder projects
   */
  async reorderProjects(
    userId: string,
    projectOrders: Array<{ id: string; order: number }>
  ): Promise<void> {
    const projectIds = projectOrders.map((po) => po.id);

    // Get all projects that belong to the user
    const projects = await this.projectRepository
      .createQueryBuilder("project")
      .where("project.id IN (:...projectIds)", { projectIds })
      .andWhere("project.ownerId = :userId", { userId })
      .getMany();

    // Update orders
    for (const project of projects) {
      const newOrder = projectOrders.find((po) => po.id === project.id)?.order;
      if (newOrder !== undefined) {
        project.order = newOrder;
      }
    }

    await this.projectRepository.save(projects);
  }

  /**
   * Archive/unarchive a project
   */
  async toggleArchive(
    projectId: string,
    userId: string,
    isArchived: boolean
  ): Promise<Project | null> {
    return await this.updateProject(projectId, userId, { isArchived });
  }
}
