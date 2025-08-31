import mongoose from "mongoose"

const resourceAssignmentSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["assigned", "viewed", "completed"],
      default: "assigned",
    },
    viewedAt: Date,
    completedAt: Date,
    notes: {
      type: String,
      maxlength: 500,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: Date,
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient querying
resourceAssignmentSchema.index({ patientId: 1, status: 1 })
resourceAssignmentSchema.index({ providerId: 1, assignedAt: -1 })
resourceAssignmentSchema.index({ resourceId: 1, patientId: 1 }, { unique: true })

export default mongoose.model("ResourceAssignment", resourceAssignmentSchema)
