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

router.put("/bp-thresholds", authenticate, updateThresholdsValidation, updateBPThresholds)
router.put("/change-password", authenticate, changePasswordValidation, changePassword)
router.delete("/account", authenticate, deleteAccount)

// Admin routes
router.get("/", authenticate, authorize("admin"), getAllUsers)
router.get("/:id", authenticate, authorize("admin", "provider"), param("id").isMongoId(), getUserById)

export default router
