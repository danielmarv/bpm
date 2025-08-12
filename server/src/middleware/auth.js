import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      const user = await User.findById(decoded.userId).select("-password -refreshTokens")

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User not found or inactive",
        })
      }

      req.user = user
      next()
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      })
    }
  } catch (error) {
    console.error("Authentication error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      })
    }

    next()
  }
}

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7)
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      const user = await User.findById(decoded.userId).select("-password -refreshTokens")

      if (user && user.isActive) {
        req.user = user
      }
    } catch (error) {
      // Token invalid, but continue without user
    }
  }

  next()
}
