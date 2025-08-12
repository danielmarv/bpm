import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["patient", "provider", "admin"],
      default: "patient",
    },
    profile: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      dateOfBirth: Date,
      gender: { type: String, enum: ["male", "female", "other"] },
      phone: String,
      emergencyContact: {
        name: String,
        phone: String,
        relationship: String,
      },
    },
    bpThresholds: {
      systolicHigh: { type: Number, default: 140 },
      systolicLow: { type: Number, default: 90 },
      diastolicHigh: { type: Number, default: 90 },
      diastolicLow: { type: Number, default: 60 },
    },
    preferences: {
      notifications: {
        medication: { type: Boolean, default: true },
        appointments: { type: Boolean, default: true },
        readings: { type: Boolean, default: true },
      },
      timezone: { type: String, default: "UTC" },
    },
    refreshTokens: [String],
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.password
  delete userObject.refreshTokens
  return userObject
}

export default mongoose.model("User", userSchema)
