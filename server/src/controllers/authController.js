import User from "../models/User.js"
import { validationResult } from "express-validator"
import { generateTokens, verifyRefreshToken } from "../services/tokenService.js"
import crypto from "crypto"

export const register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { email, password, firstName, lastName, role = "patient" } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Create new user
    const user = new User({
      email,
      password,
      role,
      profile: { firstName, lastName },
    })

    await user.save()

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id)

    // Save refresh token
    user.refreshTokens.push(refreshToken)
    await user.save()

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const login = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { email, password } = req.body

    // Find user and include password for comparison
    const user = await User.findOne({ email, isActive: true }).select("+password")
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id)

    // Save refresh token and update last login
    user.refreshTokens.push(refreshToken)
    user.lastLogin = new Date()
    await user.save()

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user,
        accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      })
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)
    const user = await User.findById(decoded.userId)

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id)

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken)
    user.refreshTokens.push(newRefreshToken)
    await user.save()

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    })
  }
}

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body
    const userId = req.user.id

    if (refreshToken) {
      // Remove specific refresh token
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: refreshToken },
      })
    } else {
      // Remove all refresh tokens (logout from all devices)
      await User.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] },
      })
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" })
    }

    const user = await User.findOne({ email })
    // Respond generically to avoid user enumeration
    if (!user) {
      return res.json({ success: true, message: "If an account exists, a reset link has been sent" })
    }

    // Generate secure token and expiry (1 hour)
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    user.passwordReset = { token, expiresAt, used: false }
    await user.save()

    // TODO: Send email with reset link. For now, return token in non-production for testing only.
    const isProd = process.env.NODE_ENV === "production"
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000"
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    if (!isProd) {
      console.info(`Password reset link for ${email}: ${resetLink}`)
      return res.json({ success: true, data: { resetLink, token }, message: "Reset link generated" })
    }

    // In production, integrate a mailer service and do not include the token in the response
    return res.json({ success: true, message: "If an account exists, a reset link has been sent" })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and new password are required" })
    }

    if (typeof password !== "string" || password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 chars and include lowercase, uppercase and a number" })
    }

    const user = await User.findOne({ "passwordReset.token": token })
    if (!user || !user.passwordReset) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" })
    }

    const { expiresAt, used } = user.passwordReset
    if (used || !expiresAt || new Date(expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" })
    }

    // Set new password; pre-save hook will hash it
    user.password = password
    user.passwordReset.used = true
    await user.save()

    // Invalidate all refresh tokens (force re-login everywhere)
    user.refreshTokens = []
    await user.save()

    return res.json({ success: true, message: "Password has been reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}
