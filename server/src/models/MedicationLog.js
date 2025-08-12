import mongoose from "mongoose"

const medicationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medication",
      required: true,
    },
    takenAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    sideEffects: [String],
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
medicationLogSchema.index({ userId: 1, medicationId: 1, takenAt: -1 })

export default mongoose.model("MedicationLog", medicationLogSchema)
