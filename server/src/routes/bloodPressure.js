import express from "express"
import { body, query, param } from "express-validator"
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
 *     summary: Get blood pressure readings with filtering and pagination
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
 *       - in: query
 *         name: abnormalOnly
 *         schema:
 *           type: boolean
 *         description: Filter only abnormal readings
 *     responses:
 *       200:
 *         description: Readings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, queryValidation, getReadings)

/**
 * @swagger
 * /api/blood-pressure/stats:
 *   get:
 *     summary: Get blood pressure statistics for a user
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
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", authenticate, queryValidation, getReadingStats)

/**
 * @swagger
 * /api/blood-pressure/abnormal:
 *   get:
 *     summary: Get abnormal blood pressure readings
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: Abnormal readings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/abnormal", authenticate, queryValidation, getAbnormalReadings)

/**
 * @swagger
 * /api/blood-pressure/{id}:
 *   get:
 *     summary: Get a single blood pressure reading by ID
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reading ID
 *     responses:
 *       200:
 *         description: Reading retrieved successfully
 *       404:
 *         description: Reading not found
 */
router.get("/:id", authenticate, param("id").isMongoId(), getReading)

/**
 * @swagger
 * /api/blood-pressure/{id}:
 *   put:
 *     summary: Update a blood pressure reading by ID
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reading ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       200:
 *         description: Reading updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Reading not found
 */
router.put("/:id", authenticate, param("id").isMongoId(), createReadingValidation, updateReading)

/**
 * @swagger
 * /api/blood-pressure/{id}:
 *   delete:
 *     summary: Delete a blood pressure reading by ID
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reading ID
 *     responses:
 *       200:
 *         description: Reading deleted successfully
 *       404:
 *         description: Reading not found
 */
router.delete("/:id", authenticate, param("id").isMongoId(), deleteReading)

export default router
