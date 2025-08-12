import mongoose from "mongoose"

const bloodPressureSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    systolic: {
      type: Number,
      required: true,
      min: 50,
      max: 300,
    },
    diastolic: {
      type: Number,
      required: true,
      min: 30,
      max: 200,
    },
    pulse: {
      type: Number,
      min: 30,
      max: 200,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
      enum: ["home", "clinic", "pharmacy", "other"],
      default: "home",
    },
    position: {
      type: String,
      enum: ["sitting", "standing", "lying"],
      default: "sitting",
    },
    arm: {
      type: String,
      enum: ["left", "right"],
      default: "left",
    },
    isAbnormal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
bloodPressureSchema.index({ userId: 1, timestamp: -1 })
bloodPressureSchema.index({ userId: 1, isAbnormal: 1 })

// Pre-save middleware to determine if reading is abnormal
bloodPressureSchema.pre("save", async function (next) {
  try {
    const User = mongoose.model("User")
    const user = await User.findById(this.userId)

    if (user && user.bpThresholds) {
      const { systolicHigh, systolicLow, diastolicHigh, diastolicLow } = user.bpThresholds

      this.isAbnormal =
        this.systolic > systolicHigh ||
        this.systolic < systolicLow ||
        this.diastolic > diastolicHigh ||
        this.diastolic < diastolicLow
    }

    next()
  } catch (error) {
    next(error)
  }
})

export default mongoose.model("BloodPressure", bloodPressureSchema)
