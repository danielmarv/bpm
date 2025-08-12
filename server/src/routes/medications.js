import express from "express"
import { body, param } from "express-validator"
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

router.get("/refills", authenticate, getUpcomingRefills)
router.get("/:id", authenticate, param("id").isMongoId(), getMedication)
router.put("/:id", authenticate, param("id").isMongoId(), medicationValidation, updateMedication)
router.delete("/:id", authenticate, param("id").isMongoId(), deleteMedication)

// Medication logging
router.post("/:id/log", authenticate, param("id").isMongoId(), logMedicationTaken)
router.get("/:id/logs", authenticate, param("id").isMongoId(), getMedicationLogs)

export default router
