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
 *         description: Search in title and content
 *     responses:
 *       200:
 *         description: Resources retrieved successfully
 */
router.get("/", optionalAuth, getResources)

router.get("/categories", getResourceCategories)
router.get("/:id", optionalAuth, param("id").isMongoId(), getResource)
router.put(
  "/:id",
  authenticate,
  authorize("admin", "provider"),
  param("id").isMongoId(),
  resourceValidation,
  updateResource,
)
router.delete("/:id", authenticate, authorize("admin", "provider"), param("id").isMongoId(), deleteResource)

export default router
