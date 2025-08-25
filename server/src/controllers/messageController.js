import Message from "../models/Message.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation errors", errors: errors.array() });
    }

    const { receiverId, subject, body, priority = "normal" } = req.body;

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: "Receiver not found" });

    const message = new Message({
      senderId: req.user._id,
      receiverId,
      subject,
      body,
      priority,
    });

    await message.save();
    await message.populate("senderId", "profile.firstName profile.lastName role");
    await message.populate("receiverId", "profile.firstName profile.lastName role");

    res.status(201).json({ success: true, message: "Message sent successfully", data: message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get paginated messages
export const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10, unread } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { $or: [{ senderId: req.user._id }, { receiverId: req.user._id }] };

    if (unread === "true") query.isRead = false;

    const messages = await Message.find(query)
      .populate("senderId", "profile.firstName profile.lastName role")
      .populate("receiverId", "profile.firstName profile.lastName role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Message.countDocuments(query);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get a single message
export const getMessage = async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .populate("senderId", "profile.firstName profile.lastName role")
      .populate("receiverId", "profile.firstName profile.lastName role");

    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error("Get message error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, receiverId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    res.json({ success: true, message: "Message marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    });

    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get user conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      { $match: { $or: [{ senderId: req.user._id }, { receiverId: req.user._id }] } },
      {
        $addFields: {
          otherUserId: { $cond: [{ $eq: ["$senderId", req.user._id] }, "$receiverId", "$senderId"] },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$otherUserId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: { $cond: [{ $and: [{ $eq: ["$receiverId", req.user._id] }, { $eq: ["$isRead", false] }] }, 1, 0] },
          },
        },
      },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "otherUser" } },
      { $unwind: "$otherUser" },
      {
        $project: {
          otherUser: { _id: 1, "profile.firstName": 1, "profile.lastName": 1, role: 1 },
          lastMessage: { subject: 1, body: 1, createdAt: 1, isRead: 1 },
          unreadCount: 1,
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
