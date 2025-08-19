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
