import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { ProjectService } from "../services/project.service";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Instantiate service and controller
const projectService = new ProjectService();
const projectController = new ProjectController(projectService);

// Instantiate auth middleware
const authMiddleware = new AuthMiddleware();

// All routes require authentication
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /projects/reorder:
 *   patch:
 *     tags: [Projects]
 *     summary: Reorder projects
 *     description: Update the display order of multiple projects
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/ReorderProjectsDto'
 *     responses:
 *       200:
 *         description: Projects reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ApiResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch("/reorder", projectController.reorderProjects);

/**
 * @swagger
 * /projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project
 *     description: Create a new project with optional team members
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/CreateProjectDto'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/definitions/Project'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   get:
 *     tags: [Projects]
 *     summary: Get all projects
 *     description: Retrieve all projects for the authenticated user with filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for project name or description
 *       - in: query
 *         name: isArchived
 *         schema:
 *           type: boolean
 *         description: Filter by archived status
 *       - in: query
 *         name: isShared
 *         schema:
 *           type: boolean
 *         description: Filter by shared status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, order]
 *           default: order
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 */
router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by ID
 *     description: Retrieve a single project with all its details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/definitions/Project'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *   put:
 *     tags: [Projects]
 *     summary: Update project
 *     description: Update project details (owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/UpdateProjectDto'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/definitions/Project'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only owner can update
 *       404:
 *         description: Project not found
 *   delete:
 *     tags: [Projects]
 *     summary: Delete project
 *     description: Delete a project (owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only owner can delete
 *       404:
 *         description: Project not found
 */
router.get("/:id", projectController.getProjectById);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

/**
 * @swagger
 * /projects/{id}/archive:
 *   patch:
 *     tags: [Projects]
 *     summary: Archive or unarchive project
 *     description: Toggle the archived status of a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isArchived
 *             properties:
 *               isArchived:
 *                 type: boolean
 *                 description: Archive status
 *     responses:
 *       200:
 *         description: Project archive status updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only owner can archive
 *       404:
 *         description: Project not found
 */
router.patch("/:id/archive", projectController.toggleArchive);

/**
 * @swagger
 * /projects/{id}/members:
 *   post:
 *     tags: [Projects]
 *     summary: Add members to project
 *     description: Add team members to a project (owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/AddProjectMembersDto'
 *     responses:
 *       200:
 *         description: Members added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only owner can add members
 *       404:
 *         description: Project not found
 */
router.post("/:id/members", projectController.addMembers);

/**
 * @swagger
 * /projects/{id}/members/{userId}:
 *   delete:
 *     tags: [Projects]
 *     summary: Remove member from project
 *     description: Remove a team member from a project (owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only owner can remove members
 *       404:
 *         description: Project not found
 */
router.delete("/:id/members/:userId", projectController.removeMember);

export default router;
