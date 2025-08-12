import express from "express"
import { body, param } from "express-validator"
import { authenticate } from "../middleware/auth.js"
import {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  getActivityStats,
} from "../controllers/activityController.js"

const router = express.Router()

// Validation rules
const activityValidation = [
  body("type").isIn(["exercise", "diet", "weight", "stress_reduction"]).withMessage("Invalid activity type"),
  body("date").isISO8601().withMessage("Valid date required"),
  body("data").isObject().withMessage("Activity data required"),
]

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Log a new activity
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - date
 *               - data
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [exercise, diet, weight, stress_reduction]
 *               date:
 *                 type: string
 *                 format: date
 *               data:
 *                 type: object
 *                 description: Activity-specific data
 *     responses:
 *       201:
 *         description: Activity logged successfully
 *       400:
 *         description: Validation error
 */
router.post("/", authenticate, activityValidation, createActivity)

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get user activities
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [exercise, diet, weight, stress_reduction]
 *         description: Filter by activity type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
 */
router.get("/", authenticate, getActivities)

router.get("/stats", authenticate, getActivityStats)
router.get("/:id", authenticate, param("id").isMongoId(), getActivity)
router.put("/:id", authenticate, param("id").isMongoId(), activityValidation, updateActivity)
router.delete("/:id", authenticate, param("id").isMongoId(), deleteActivity)

export default router
