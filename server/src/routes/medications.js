import express from "express"
import { body, param, query } from "express-validator"
import { authenticate } from "../middleware/auth.js"
import {
  createMedication,
  getMedications,
  getMedication,
  updateMedication,
  deleteMedication,
  logMedicationTaken,
  getMedicationLogs,
  getUpcomingRefills,
} from "../controllers/medicationController.js"

const router = express.Router()

// Validation rules
const medicationValidation = [
  body("name").trim().isLength({ min: 1 }).withMessage("Medication name required"),
  body("dosage.amount").isFloat({ min: 0 }).withMessage("Valid dosage amount required"),
  body("dosage.unit").trim().isLength({ min: 1 }).withMessage("Dosage unit required"),
  body("frequency")
    .isIn(["once_daily", "twice_daily", "three_times_daily", "four_times_daily", "as_needed", "custom"])
    .withMessage("Invalid frequency"),
  body("startDate").isISO8601().withMessage("Valid start date required"),
  body("endDate").optional().isISO8601().withMessage("Invalid end date"),
]

/**
 * @swagger
 * /api/medications:
 *   post:
 *     summary: Create a new medication
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - dosage
 *               - frequency
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *               dosage:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                   unit:
 *                     type: string
 *               frequency:
 *                 type: string
 *                 enum: [once_daily, twice_daily, three_times_daily, four_times_daily, as_needed, custom]
 *               startDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Medication created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", authenticate, medicationValidation, createMedication)

/**
 * @swagger
 * /api/medications:
 *   get:
 *     summary: Get user medications
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Medications retrieved successfully
 */
router.get("/", authenticate, getMedications)

/**
 * @swagger
 * /api/medications/refills:
 *   get:
 *     summary: Get upcoming medication refills within 30 days
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upcoming refills retrieved successfully
 */
router.get("/refills", authenticate, getUpcomingRefills)

/**
 * @swagger
 * /api/medications/{id}:
 *   get:
 *     summary: Get a single medication by ID
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication ID
 *     responses:
 *       200:
 *         description: Medication retrieved successfully
 *       404:
 *         description: Medication not found
 */
router.get("/:id", authenticate, param("id").isMongoId(), getMedication)

/**
 * @swagger
 * /api/medications/{id}:
 *   put:
 *     summary: Update a medication by ID
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dosage:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                   unit:
 *                     type: string
 *               frequency:
 *                 type: string
 *                 enum: [once_daily, twice_daily, three_times_daily, four_times_daily, as_needed, custom]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Medication updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Medication not found
 */
router.put("/:id", authenticate, param("id").isMongoId(), medicationValidation, updateMedication)

/**
 * @swagger
 * /api/medications/{id}:
 *   delete:
 *     summary: Deactivate a medication by ID
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication ID
 *     responses:
 *       200:
 *         description: Medication deactivated successfully
 *       404:
 *         description: Medication not found
 */
router.delete("/:id", authenticate, param("id").isMongoId(), deleteMedication)

/**
 * @swagger
 * /api/medications/{id}/log:
 *   post:
 *     summary: Log that a medication dose was taken
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               takenAt:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Medication dose logged successfully
 *       404:
 *         description: Medication not found
 */
router.post("/:id/log", authenticate, param("id").isMongoId(), logMedicationTaken)

/**
 * @swagger
 * /api/medications/{id}/logs:
 *   get:
 *     summary: Get logs for a specific medication
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication ID
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
 *           default: 50
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Medication logs retrieved successfully
 */
router.get("/:id/logs", authenticate, param("id").isMongoId(), getMedicationLogs)

export default router
