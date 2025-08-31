import User from "../models/User.js"
import { validationResult } from "express-validator"

export const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true, runValidators: true })

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const updateBPThresholds = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { bpThresholds: req.body } },
      { new: true, runValidators: true },
    )

    res.json({
      success: true,
      message: "BP thresholds updated successfully",
      data: user.bpThresholds,
    })
  } catch (error) {
    console.error("Update BP thresholds error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { currentPassword, newPassword } = req.body

    // Get user with password
    const user = await User.findById(req.user._id).select("+password")

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false })

    res.json({
      success: true,
      message: "Account deactivated successfully",
    })
  } catch (error) {
    console.error("Delete account error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query

    const query = { isActive: true }
    if (role) query.role = role
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
      ]
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const users = await User.find(query)
      .select("-password -refreshTokens")
      .sort({ createdAt: -1 })
      .limit(Number.parseInt(limit))
      .skip(skip)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -refreshTokens")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Get user by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const createUser = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { email, password, role, profile } = req.body

    // Check role permissions
    if (req.user.role === "provider" && role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Providers can only create patient accounts",
      })
    }

    if (req.user.role === "admin" && !["patient", "provider"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    const user = new User({
      email,
      password,
      role,
      profile,
      createdBy: req.user._id,
    })

    await user.save()

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      data: user,
    })
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getMyPatients = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query

    const query = {
      role: "patient",
      isActive: true,
      createdBy: req.user._id,
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
      ]
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const patients = await User.find(query)
      .select("-password -refreshTokens")
      .sort({ createdAt: -1 })
      .limit(Number.parseInt(limit))
      .skip(skip)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get my patients error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const updateUserRole = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { role } = req.body
    const userId = req.params.id

    if (!["patient", "provider", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      })
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true }).select(
      "-password -refreshTokens",
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: "User role updated successfully",
      data: user,
    })
  } catch (error) {
    console.error("Update user role error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
