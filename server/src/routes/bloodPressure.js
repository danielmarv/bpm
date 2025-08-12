import express from "express"
import { body, query } from "express-validator"
import { authenticate } from "../middleware/auth.js"
import {
  createReading,
  getReadings,
  getReading,
  updateReading,
  deleteReading,
  getReadingStats,
  getAbnormalReadings,
} from "../controllers/bloodPressureController.js"

const router = express.Router()

// Validation rules
const createReadingValidation = [
  body("systolic").isInt({ min: 50, max: 300 }).withMessage("Systolic must be between 50-300"),
  body("diastolic").isInt({ min: 30, max: 200 }).withMessage("Diastolic must be between 30-200"),
  body("pulse").optional().isInt({ min: 30, max: 200 }).withMessage("Pulse must be between 30-200"),
  body("timestamp").optional().isISO8601().withMessage("Invalid timestamp format"),
  body("notes").optional().isLength({ max: 500 }).withMessage("Notes must be less than 500 characters"),
]

const queryValidation = [
  query("startDate").optional().isISO8601().withMessage("Invalid start date format"),
  query("endDate").optional().isISO8601().withMessage("Invalid end date format"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1-100"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be greater than 0"),
]

/**
 * @swagger
 * /api/blood-pressure:
 *   post:
 *     summary: Create a new blood pressure reading
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - systolic
 *               - diastolic
 *             properties:
 *               systolic:
 *                 type: integer
 *                 minimum: 50
 *                 maximum: 300
 *               diastolic:
 *                 type: integer
 *                 minimum: 30
 *                 maximum: 200
 *               pulse:
 *                 type: integer
 *                 minimum: 30
 *                 maximum: 200
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Reading created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, createReadingValidation, createReading)

/**
 * @swagger
 * /api/blood-pressure:
 *   get:
 *     summary: Get blood pressure readings with filtering
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: Readings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, queryValidation, getReadings)

router.get("/stats", authenticate, queryValidation, getReadingStats)
router.get("/abnormal", authenticate, queryValidation, getAbnormalReadings)
router.get("/:id", authenticate, getReading)
router.put("/:id", authenticate, createReadingValidation, updateReading)
router.delete("/:id", authenticate, deleteReading)

export default router
