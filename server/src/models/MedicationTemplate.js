import mongoose from "mongoose"

const medicationTemplateSchema = new mongoose.Schema(
  {
    // Provider who created this template
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Basic medication information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    // Dosage information
    dosage: {
      amount: { 
        type: Number, 
        required: true,
        min: 0 
      },
      unit: { 
        type: String, 
        required: true,
        trim: true 
      }, // mg, ml, tablets, etc.
    },
    // Frequency and timing
    frequency: {
      type: String,
      required: true,
      enum: ["once_daily", "twice_daily", "three_times_daily", "four_times_daily", "as_needed", "custom"],
    },
    customSchedule: [
      {
        time: String, // HH:MM format
        days: [{ 
          type: String, 
          enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] 
        }],
      },
    ],
    // Medical information
    category: {
      type: String,
      required: true,
      enum: ["hypertension", "diabetes", "heart_disease", "cholesterol", "anxiety", "depression", "pain_relief", "antibiotics", "vitamins", "other"],
    },
    instructions: {
      type: String,
      maxlength: 1000,
    },
    commonSideEffects: [String],
    warnings: [String],
    // Default duration (optional)
    defaultDuration: {
      amount: Number,
      unit: {
        type: String,
        enum: ["days", "weeks", "months", "years"]
      }
    },
    // Template metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false, // If true, other providers can see and use this template
    },
    tags: [String], // For categorization and search
    usageCount: {
      type: Number,
      default: 0,
    },
    // Approval status for public templates
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who approved
    },
    approvedAt: Date,
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient querying
medicationTemplateSchema.index({ providerId: 1, isActive: 1 })
medicationTemplateSchema.index({ category: 1, isActive: 1 })
medicationTemplateSchema.index({ isPublic: 1, approvalStatus: 1, isActive: 1 })
medicationTemplateSchema.index({ name: "text", description: "text", tags: "text" })

// Virtual for getting provider information
medicationTemplateSchema.virtual("provider", {
  ref: "User",
  localField: "providerId",
  foreignField: "_id",
  justOne: true,
})

// Method to increment usage count
medicationTemplateSchema.methods.incrementUsage = async function() {
  this.usageCount += 1
  return await this.save()
}

// Static method to find templates accessible to a provider
medicationTemplateSchema.statics.findAccessibleToProvider = function(providerId, filters = {}) {
  const query = {
    $or: [
      { providerId: providerId }, // Own templates
      { isPublic: true, approvalStatus: "approved" }, // Approved public templates
    ],
    isActive: true,
    ...filters,
  }
  return this.find(query).populate("providerId", "profile.firstName profile.lastName email")
}

// Static method to find public templates for patients
medicationTemplateSchema.statics.findPublicTemplates = function(filters = {}) {
  const query = {
    isPublic: true,
    approvalStatus: "approved",
    isActive: true,
    ...filters,
  }
  return this.find(query).populate("providerId", "profile.firstName profile.lastName")
}

export default mongoose.model("MedicationTemplate", medicationTemplateSchema)
