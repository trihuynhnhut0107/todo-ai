import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { TaskService } from "../services/task.service";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Instantiate service and controller
const taskService = new TaskService();
const taskController = new TaskController(taskService);

// Instantiate auth middleware
const authMiddleware = new AuthMiddleware();

// All routes require authentication
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /tasks/stats:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task statistics
 *     description: Retrieve comprehensive task statistics for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/definitions/TaskStats'
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", taskController.getTaskStats);

/**
 * @swagger
 * /tasks/bulk:
 *   patch:
 *     tags: [Tasks]
 *     summary: Bulk update tasks
 *     description: Update multiple tasks at once
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/BulkUpdateTasksDto'
 *     responses:
 *       200:
 *         description: Tasks updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/definitions/Task'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch("/bulk", taskController.bulkUpdateTasks);

/**
 * @swagger
 * /tasks/reorder:
 *   patch:
 *     tags: [Tasks]
 *     summary: Reorder tasks
 *     description: Update the display order of multiple tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/ReorderTasksDto'
 *     responses:
 *       200:
 *         description: Tasks reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ApiResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch("/reorder", taskController.reorderTasks);

/**
 * @swagger
 * /tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
 *     description: Create a new task with optional project assignment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/CreateTaskDto'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/definitions/Task'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Project access denied
 *       404:
 *         description: Project not found
 *   get:
 *     tags: [Tasks]
 *     summary: Get all tasks
 *     description: Retrieve all tasks for the authenticated user with filtering and pagination
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
 *         description: Search term for task title or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         description: Filter by task status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by task priority
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by project ID
 *       - in: query
 *         name: assignedToId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by assigned user ID
 *       - in: query
 *         name: dueBefore
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter tasks due before this date
 *       - in: query
 *         name: dueAfter
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter tasks due after this date
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by tags
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, dueDate, priority, order]
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
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 */
router.post("/", taskController.createTask);
router.get("/", taskController.getTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by ID
 *     description: Retrieve a single task with all its details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/definitions/Task'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *   put:
 *     tags: [Tasks]
 *     summary: Update task
 *     description: Update task details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/UpdateTaskDto'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/definitions/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only task owner can update
 *       404:
 *         description: Task not found
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete task
 *     description: Delete a task (owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only task owner can delete
 *       404:
 *         description: Task not found
 */
router.get("/:id", taskController.getTaskById);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

export default router;
