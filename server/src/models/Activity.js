import mongoose from "mongoose"

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["exercise", "diet", "weight", "stress_reduction"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
activitySchema.index({ userId: 1, type: 1, date: -1 })

export default mongoose.model("Activity", activitySchema)
