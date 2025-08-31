import express from "express"
import { body, param } from "express-validator"
import { authenticate, authorize } from "../middleware/auth.js"
import {
  getProfile,
  updateProfile,
  updateBPThresholds,
  changePassword,
  deleteAccount,
  getAllUsers,
  getUserById,
  createUser,
  getMyPatients,
  updateUserRole,
} from "../controllers/userController.js"

const router = express.Router()

// Validation rules
const updateProfileValidation = [
  body("profile.firstName").optional().trim().isLength({ min: 1 }).withMessage("First name cannot be empty"),
  body("profile.lastName").optional().trim().isLength({ min: 1 }).withMessage("Last name cannot be empty"),
  body("profile.phone").optional().isMobilePhone().withMessage("Invalid phone number"),
  body("profile.dateOfBirth").optional().isISO8601().withMessage("Invalid date format"),
]

const updateThresholdsValidation = [
  body("systolicHigh").optional().isInt({ min: 90, max: 200 }).withMessage("Invalid systolic high threshold"),
  body("systolicLow").optional().isInt({ min: 70, max: 150 }).withMessage("Invalid systolic low threshold"),
  body("diastolicHigh").optional().isInt({ min: 60, max: 120 }).withMessage("Invalid diastolic high threshold"),
  body("diastolicLow").optional().isInt({ min: 40, max: 90 }).withMessage("Invalid diastolic low threshold"),
]

const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase, uppercase, and number"),
]

const createUserValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase, uppercase, and number"),
  body("role").isIn(["patient", "provider"]).withMessage("Invalid role"),
  body("profile.firstName").trim().isLength({ min: 1 }).withMessage("First name required"),
  body("profile.lastName").trim().isLength({ min: 1 }).withMessage("Last name required"),
  body("profile.phone").optional().isMobilePhone().withMessage("Invalid phone number"),
  body("profile.dateOfBirth").optional().isISO8601().withMessage("Invalid date format"),
]

const updateRoleValidation = [body("role").isIn(["patient", "provider", "admin"]).withMessage("Invalid role")]

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticate, getProfile)

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put("/profile", authenticate, updateProfileValidation, updateProfile)

/**
 * @swagger
 * /api/users/bp-thresholds:
 *   put:
 *     summary: Update user blood pressure thresholds
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               systolicHigh:
 *                 type: integer
 *               systolicLow:
 *                 type: integer
 *               diastolicHigh:
 *                 type: integer
 *               diastolicLow:
 *                 type: integer
 *     responses:
 *       200:
 *         description: BP thresholds updated successfully
 *       400:
 *         description: Validation error
 */
router.put("/bp-thresholds", authenticate, updateThresholdsValidation, updateBPThresholds)

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error or incorrect current password
 */
router.put("/change-password", authenticate, changePasswordValidation, changePassword)

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Deactivate user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 */
router.delete("/account", authenticate, deleteAccount)

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create a new user (Admin can create providers/patients, Providers can create patients)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - profile
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [patient, provider]
 *               profile:
 *                 type: object
 *                 required:
 *                   - firstName
 *                   - lastName
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or user already exists
 *       403:
 *         description: Insufficient permissions
 */
router.post("/create", authenticate, authorize("admin", "provider"), createUserValidation, createUser)

/**
 * @swagger
 * /api/users/my-patients:
 *   get:
 *     summary: Get patients created by the current provider
 *     tags: [Users]
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
 *         name: search
 *         schema:
 *           type: string
 *           description: Search by first name, last name, or email
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 */
router.get("/my-patients", authenticate, authorize("provider"), getMyPatients)

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [patient, provider, admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.put("/:id/role", authenticate, authorize("admin"), param("id").isMongoId(), updateRoleValidation, updateUserRole)

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           description: Filter by role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Search by first name, last name, or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get("/", authenticate, authorize("admin"), getAllUsers)

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID (Admin/Provider)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/:id", authenticate, authorize("admin", "provider"), param("id").isMongoId(), getUserById)

export default router
