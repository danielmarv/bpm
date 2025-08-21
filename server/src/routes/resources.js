import express from "express"
import { body, param, query } from "express-validator"
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js"
import {
  createResource,
  getResources,
  getResource,
  updateResource,
  deleteResource,
  getResourceCategories,
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
