import express from "express";
import { body, param, query, validationResult } from "express-validator";
import { authenticate } from "../middleware/auth.js";
import {
  sendMessage,
  getMessages,
  getMessage,
  markAsRead,
  deleteMessage,
  getConversations,
} from "../controllers/messageController.js";

const router = express.Router();

// Middleware to handle validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Validation errors", errors: errors.array() });
  }
  next();
};

// Validation rules
const messageValidation = [
  body("receiverId").isMongoId().withMessage("Valid receiver ID required"),
  body("subject")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Subject required (max 200 characters)"),
  body("body")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message body required (max 2000 characters)"),
  body("priority")
    .optional()
    .isIn(["low", "normal", "high", "urgent"])
    .withMessage("Invalid priority level"),
];

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
router.post("/", authenticate, messageValidation, handleValidation, sendMessage);

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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of messages per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 */
router.get(
  "/",
  authenticate,
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1 }).withMessage("Limit must be a positive integer"),
    query("unread").optional().isBoolean().withMessage("Unread must be a boolean"),
    query("type").optional().isIn(["inbox", "sent"]).withMessage("Type must be inbox or sent"),
  ],
  handleValidation,
  getMessages
);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get user conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 */
router.get("/conversations", authenticate, getConversations);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Get a single message by ID
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message retrieved successfully
 *       404:
 *         description: Message not found
 */
router.get("/:id", authenticate, param("id").isMongoId().withMessage("Invalid message ID"), handleValidation, getMessage);

/**
 * @swagger
 * /api/messages/{id}/read:
 *   put:
 *     summary: Mark a message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message marked as read
 *       404:
 *         description: Message not found
 */
router.put("/:id/read", authenticate, param("id").isMongoId().withMessage("Invalid message ID"), handleValidation, markAsRead);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 */
router.delete("/:id", authenticate, param("id").isMongoId().withMessage("Invalid message ID"), handleValidation, deleteMessage);

export default router;
