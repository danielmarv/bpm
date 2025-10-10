import express from "express"
import { body, param } from "express-validator"
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js"
import {
  createResource,
  getResources,
  getResource,
  updateResource,
  deleteResource,
  getResourceCategories,
  assignResourceToPatient,
  getMyAssignedResources,
  getMyResourceAssignments,
  updateResourceStatus,
  removeResourceAssignment,
} from "../controllers/resourceController.js"

const router = express.Router()

// Validation rules
const resourceValidation = [
  body("title").trim().isLength({ min: 1, max: 200 }).withMessage("Title required (max 200 characters)"),
  body("content").trim().isLength({ min: 1 }).withMessage("Content required"),
  body("category")
    .isIn(["hypertension", "diet", "exercise", "medication", "lifestyle", "general"])
    .withMessage("Invalid category"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
]

const assignmentValidation = [
  body("notes").optional().isLength({ max: 500 }).withMessage("Notes must be less than 500 characters"),
  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
  body("dueDate").optional().isISO8601().withMessage("Invalid due date"),
]

const statusValidation = [body("status").isIn(["assigned", "viewed", "completed"]).withMessage("Invalid status")]

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Create a new educational resource (Admin/Provider only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [hypertension, diet, exercise, medication, lifestyle, general]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Resource created successfully
 *       403:
 *         description: Insufficient permissions
 */
router.post("/", authenticate, authorize("admin", "provider"), resourceValidation, createResource)

/**
 * @swagger
 * /api/resources/assign/{resourceId}/{patientId}:
 *   post:
 *     summary: Assign a resource to a patient (Provider only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Resource assigned successfully
 *       400:
 *         description: Resource already assigned or validation error
 *       404:
 *         description: Resource or patient not found
 */
router.post(
  "/assign/:resourceId/:patientId",
  authenticate,
  authorize("provider"),
  param("resourceId").isMongoId(),
  param("patientId").isMongoId(),
  assignmentValidation,
  assignResourceToPatient,
)

/**
 * @swagger
 * /api/resources/my-assigned:
 *   get:
 *     summary: Get resources assigned to the current patient
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [assigned, viewed, completed]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [hypertension, diet, exercise, medication, lifestyle, general]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Assigned resources retrieved successfully
 */
router.get("/my-assigned", authenticate, getMyAssignedResources)

/**
 * @swagger
 * /api/resources/my-assignments:
 *   get:
 *     summary: Get resource assignments made by the current provider
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by specific patient
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [assigned, viewed, completed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Resource assignments retrieved successfully
 */
router.get("/my-assignments", authenticate, authorize("provider"), getMyResourceAssignments)

/**
 * @swagger
 * /api/resources/assignment/{assignmentId}/status:
 *   put:
 *     summary: Update resource assignment status (Patient only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [assigned, viewed, completed]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Assignment not found
 */
router.put(
  "/assignment/:assignmentId/status",
  authenticate,
  authorize("patient"),
  param("assignmentId").isMongoId(),
  statusValidation,
  updateResourceStatus,
)

/**
 * @swagger
 * /api/resources/assignment/{assignmentId}:
 *   delete:
 *     summary: Remove resource assignment (Provider only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Assignment removed successfully
 *       404:
 *         description: Assignment not found
 */
router.delete(
  "/assignment/:assignmentId",
  authenticate,
  authorize("provider"),
  param("assignmentId").isMongoId(),
  removeResourceAssignment,
)

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Get educational resources
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [hypertension, diet, exercise, medication, lifestyle, general]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, content, and tags
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Resources retrieved successfully
 */
router.get("/", optionalAuth, getResources)

/**
 * @swagger
 * /api/resources/categories:
 *   get:
 *     summary: Get list of resource categories
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get("/categories", getResourceCategories)

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     summary: Get a single resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource retrieved successfully
 *       404:
 *         description: Resource not found
 */
router.get("/:id", optionalAuth, param("id").isMongoId(), getResource)

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: Update a resource (Admin/Provider only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [hypertension, diet, exercise, medication, lifestyle, general]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Resource not found
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin", "provider"),
  param("id").isMongoId(),
  resourceValidation,
  updateResource,
)

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource (Admin/Provider only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Resource not found
 */
router.delete("/:id", authenticate, authorize("admin", "provider"), param("id").isMongoId(), deleteResource)

export default router
