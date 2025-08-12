import mongoose from "mongoose"

const medicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      amount: { type: Number, required: true },
      unit: { type: String, required: true }, // mg, ml, tablets, etc.
    },
    frequency: {
      type: String,
      required: true,
      enum: ["once_daily", "twice_daily", "three_times_daily", "four_times_daily", "as_needed", "custom"],
    },
    customSchedule: [
      {
        time: String, // HH:MM format
        days: [{ type: String, enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] }],
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    prescribedBy: {
      name: String,
      contact: String,
    },
    instructions: {
      type: String,
      maxlength: 1000,
    },
    sideEffects: [String],
    reminderSchedule: {
      enabled: { type: Boolean, default: true },
      times: [String], // Array of HH:MM times
      daysOfWeek: [Number], // 0-6, Sunday = 0
    },
    refillInfo: {
      pillsRemaining: Number,
      refillDate: Date,
      pharmacy: {
        name: String,
        phone: String,
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
medicationSchema.index({ userId: 1, active: 1 })
medicationSchema.index({ userId: 1, "refillInfo.refillDate": 1 })

export default mongoose.model("Medication", medicationSchema)
