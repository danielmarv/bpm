import express from "express"
import { body, param } from "express-validator"
import { authenticate, authorize } from "../middleware/auth.js"
import {
  createMedication,
  getMedications,
  getMedication,
  updateMedication,
  deleteMedication,
  logMedicationTaken,
  getMedicationLogs,
  getUpcomingRefills,
  prescribeMedication,
  getMyPrescriptions,
  getPatientMedications,
  createMedicationFromTemplate,
  prescribeMedicationFromTemplate,
  getAvailableTemplatesForPatient,
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

// Validation rules for template-based medication creation
const templateMedicationValidation = [
  body("startDate").isISO8601().withMessage("Valid start date required"),
  body("endDate").optional().isISO8601().withMessage("Invalid end date"),
  body("customizations").optional().isObject().withMessage("Customizations must be an object"),
  body("customizations.name").optional().trim().isLength({ min: 1 }).withMessage("Custom name required if provided"),
  body("customizations.dosage.amount").optional().isFloat({ min: 0 }).withMessage("Valid custom dosage amount required"),
  body("customizations.dosage.unit").optional().trim().isLength({ min: 1 }).withMessage("Custom dosage unit required"),
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
 * /api/medications/prescribe/{patientId}:
 *   post:
 *     summary: Prescribe medication to a patient (Provider only)
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
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
 *               endDate:
 *                 type: string
 *                 format: date
 *               instructions:
 *                 type: string
 *               sideEffects:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Medication prescribed successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Patient not found or not under your care
 */
router.post(
  "/prescribe/:patientId",
  authenticate,
  authorize("provider"),
  param("patientId").isMongoId(),
  medicationValidation,
  prescribeMedication,
)

/**
 * @swagger
 * /api/medications/my-prescriptions:
 *   get:
 *     summary: Get medications prescribed by the current provider
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by specific patient
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Prescriptions retrieved successfully
 */
router.get("/my-prescriptions", authenticate, authorize("provider"), getMyPrescriptions)

/**
 * @swagger
 * /api/medications/patient/{patientId}:
 *   get:
 *     summary: Get medications for a specific patient (Provider only)
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Patient medications retrieved successfully
 *       404:
 *         description: Patient not found or not under your care
 */
router.get(
  "/patient/:patientId",
  authenticate,
  authorize("provider"),
  param("patientId").isMongoId(),
  getPatientMedications,
)

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

/**
 * @swagger
 * /api/medications/templates/available:
 *   get:
 *     summary: Get available medication templates for patient
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search templates
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
 *         description: Available templates retrieved successfully
 */
router.get("/templates/available", authenticate, authorize("patient"), getAvailableTemplatesForPatient)

/**
 * @swagger
 * /api/medications/from-template/{templateId}:
 *   post:
 *     summary: Create medication from template (Patient)
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               customizations:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   dosage:
 *                     type: object
 *                     properties:
 *                       amount:
 *                         type: number
 *                       unit:
 *                         type: string
 *                   frequency:
 *                     type: string
 *                     enum: [once_daily, twice_daily, three_times_daily, four_times_daily, as_needed, custom]
 *                   instructions:
 *                     type: string
 *                   reminderSchedule:
 *                     type: object
 *     responses:
 *       201:
 *         description: Medication created from template successfully
 *       404:
 *         description: Template not found or not accessible
 */
router.post("/from-template/:templateId", authenticate, authorize("patient"), param("templateId").isMongoId(), templateMedicationValidation, createMedicationFromTemplate)

/**
 * @swagger
 * /api/medications/prescribe-from-template/{patientId}/{templateId}:
 *   post:
 *     summary: Prescribe medication from template (Provider)
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               customizations:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   dosage:
 *                     type: object
 *                     properties:
 *                       amount:
 *                         type: number
 *                       unit:
 *                         type: string
 *                   frequency:
 *                     type: string
 *                     enum: [once_daily, twice_daily, three_times_daily, four_times_daily, as_needed, custom]
 *                   instructions:
 *                     type: string
 *     responses:
 *       201:
 *         description: Medication prescribed from template successfully
 *       404:
 *         description: Template not found, not accessible, or patient not under care
 */
router.post("/prescribe-from-template/:patientId/:templateId", authenticate, authorize("provider"), param("patientId").isMongoId(), param("templateId").isMongoId(), templateMedicationValidation, prescribeMedicationFromTemplate)

export default router
