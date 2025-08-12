import express from "express"
import { body, param } from "express-validator"
import { authenticate } from "../middleware/auth.js"
import {
  sendMessage,
  getMessages,
  getMessage,
  markAsRead,
  deleteMessage,
  getConversations,
} from "../controllers/messageController.js"

const router = express.Router()

// Validation rules
const messageValidation = [
  body("receiverId").isMongoId().withMessage("Valid receiver ID required"),
  body("subject").trim().isLength({ min: 1, max: 200 }).withMessage("Subject required (max 200 characters)"),
  body("body").trim().isLength({ min: 1, max: 2000 }).withMessage("Message body required (max 2000 characters)"),
  body("priority").optional().isIn(["low", "normal", "high", "urgent"]).withMessage("Invalid priority level"),
]

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - subject
 *               - body
 *             properties:
 *               receiverId:
 *                 type: string
 *               subject:
 *                 type: string
 *                 maxLength: 200
 *               body:
 *                 type: string
 *                 maxLength: 2000
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *                 default: normal
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 */
router.post("/", authenticate, messageValidation, sendMessage)

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get user messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [inbox, sent]
 *         description: Message type filter
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Filter unread messages
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 */
router.get("/", authenticate, getMessages)

router.get("/conversations", authenticate, getConversations)
router.get("/:id", authenticate, param("id").isMongoId(), getMessage)
router.put("/:id/read", authenticate, param("id").isMongoId(), markAsRead)
router.delete("/:id", authenticate, param("id").isMongoId(), deleteMessage)

export default router
