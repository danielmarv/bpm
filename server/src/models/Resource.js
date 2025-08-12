import mongoose from "mongoose"

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["hypertension", "diet", "exercise", "medication", "lifestyle", "general"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    published: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      readTime: Number, // estimated read time in minutes
      difficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
      sources: [String], // external references
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient searching
resourceSchema.index({ title: "text", content: "text", tags: "text" })
resourceSchema.index({ category: 1, published: 1 })
resourceSchema.index({ featured: 1, published: 1 })

export default mongoose.model("Resource", resourceSchema)
