import express from "express"
import { body, param } from "express-validator"
import { authenticate, authorize } from "../middleware/auth.js"
import {
  createMedicationTemplate,
  getProviderTemplates,
  getPublicTemplates,
  getMedicationTemplate,
  updateMedicationTemplate,
  deleteMedicationTemplate,
  getTemplateCategories,
  approvePublicTemplate,
  getPendingTemplates,
} from "../controllers/medicationTemplateController.js"

const router = express.Router()

// Validation rules for medication templates
const medicationTemplateValidation = [
  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Template name is required and must be under 100 characters"),
  body("description").optional().isLength({ max: 500 }).withMessage("Description must be under 500 characters"),
  body("dosage.amount").isFloat({ min: 0 }).withMessage("Valid dosage amount required"),
  body("dosage.unit").trim().isLength({ min: 1 }).withMessage("Dosage unit required"),
  body("frequency")
    .isIn(["once_daily", "twice_daily", "three_times_daily", "four_times_daily", "as_needed", "custom"])
    .withMessage("Invalid frequency"),
  body("category")
    .isIn(["hypertension", "diabetes", "heart_disease", "cholesterol", "anxiety", "depression", "pain_relief", "antibiotics", "vitamins", "other"])
    .withMessage("Invalid category"),
  body("instructions").optional().isLength({ max: 1000 }).withMessage("Instructions must be under 1000 characters"),
  body("commonSideEffects").optional().isArray().withMessage("Side effects must be an array"),
  body("warnings").optional().isArray().withMessage("Warnings must be an array"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("isPublic").optional().isBoolean().withMessage("isPublic must be a boolean"),
  body("defaultDuration.amount").optional().isInt({ min: 1 }).withMessage("Default duration amount must be a positive integer"),
  body("defaultDuration.unit").optional().isIn(["days", "weeks", "months", "years"]).withMessage("Invalid duration unit"),
]

const approvalValidation = [
  body("action").isIn(["approve", "reject"]).withMessage("Action must be 'approve' or 'reject'"),
]

/**
 * @swagger
 * components:
 *   schemas:
 *     MedicationTemplate:
 *       type: object
 *       required:
 *         - name
 *         - dosage
 *         - frequency
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 500
 *         dosage:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               minimum: 0
 *             unit:
 *               type: string
 *         frequency:
 *           type: string
 *           enum: [once_daily, twice_daily, three_times_daily, four_times_daily, as_needed, custom]
 *         category:
 *           type: string
 *           enum: [hypertension, diabetes, heart_disease, cholesterol, anxiety, depression, pain_relief, antibiotics, vitamins, other]
 *         instructions:
 *           type: string
 *           maxLength: 1000
 *         commonSideEffects:
 *           type: array
 *           items:
 *             type: string
 *         warnings:
 *           type: array
 *           items:
 *             type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         isPublic:
 *           type: boolean
 *         defaultDuration:
 *           type: object
 *           properties:
 *             amount:
 *               type: integer
 *               minimum: 1
 *             unit:
 *               type: string
 *               enum: [days, weeks, months, years]
 *         usageCount:
 *           type: integer
 *         approvalStatus:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/medication-templates:
 *   post:
 *     summary: Create a new medication template (Provider only)
 *     tags: [Medication Templates]
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
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               dosage:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     minimum: 0
 *                   unit:
 *                     type: string
 *               frequency:
 *                 type: string
 *                 enum: [once_daily, twice_daily, three_times_daily, four_times_daily, as_needed, custom]
 *               category:
 *                 type: string
 *                 enum: [hypertension, diabetes, heart_disease, cholesterol, anxiety, depression, pain_relief, antibiotics, vitamins, other]
 *               instructions:
 *                 type: string
 *                 maxLength: 1000
 *               commonSideEffects:
 *                 type: array
 *                 items:
 *                   type: string
 *               warnings:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublic:
 *                 type: boolean
 *               defaultDuration:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: integer
 *                     minimum: 1
 *                   unit:
 *                     type: string
 *                     enum: [days, weeks, months, years]
 *     responses:
 *       201:
 *         description: Medication template created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Insufficient permissions
 */
router.post("/", authenticate, authorize("provider"), medicationTemplateValidation, createMedicationTemplate)

/**
 * @swagger
 * /api/medication-templates/provider:
 *   get:
 *     summary: Get medication templates accessible to the provider
 *     tags: [Medication Templates]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, description, and tags
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 */
router.get("/provider", authenticate, authorize("provider"), getProviderTemplates)

/**
 * @swagger
 * /api/medication-templates/public:
 *   get:
 *     summary: Get public medication templates (for patients)
 *     tags: [Medication Templates]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, description, and tags
 *     responses:
 *       200:
 *         description: Public templates retrieved successfully
 */
router.get("/public", authenticate, getPublicTemplates)

/**
 * @swagger
 * /api/medication-templates/categories:
 *   get:
 *     summary: Get available template categories
 *     tags: [Medication Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get("/categories", authenticate, getTemplateCategories)

/**
 * @swagger
 * /api/medication-templates/pending:
 *   get:
 *     summary: Get pending templates for approval (Admin only)
 *     tags: [Medication Templates]
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
 *     responses:
 *       200:
 *         description: Pending templates retrieved successfully
 *       403:
 *         description: Insufficient permissions
 */
router.get("/pending", authenticate, authorize("admin"), getPendingTemplates)

/**
 * @swagger
 * /api/medication-templates/{id}:
 *   get:
 *     summary: Get a specific medication template
 *     tags: [Medication Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 */
router.get("/:id", authenticate, param("id").isMongoId(), getMedicationTemplate)

/**
 * @swagger
 * /api/medication-templates/{id}:
 *   put:
 *     summary: Update a medication template (Provider only - own templates)
 *     tags: [Medication Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationTemplate'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Template not found or insufficient permissions
 */
router.put("/:id", authenticate, authorize("provider"), param("id").isMongoId(), medicationTemplateValidation, updateMedicationTemplate)

/**
 * @swagger
 * /api/medication-templates/{id}:
 *   delete:
 *     summary: Deactivate a medication template (Provider only - own templates)
 *     tags: [Medication Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found or insufficient permissions
 */
router.delete("/:id", authenticate, authorize("provider"), param("id").isMongoId(), deleteMedicationTemplate)

/**
 * @swagger
 * /api/medication-templates/{id}/approve:
 *   post:
 *     summary: Approve or reject a public template (Admin only)
 *     tags: [Medication Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *     responses:
 *       200:
 *         description: Template approval status updated
 *       400:
 *         description: Invalid action
 *       404:
 *         description: Template not found or not pending approval
 *       403:
 *         description: Insufficient permissions
 */
router.post("/:id/approve", authenticate, authorize("admin"), param("id").isMongoId(), approvalValidation, approvePublicTemplate)

export default router
