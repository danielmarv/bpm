import mongoose from "mongoose"

const quizAttemptSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        userAnswer: String, // index for MC, text for short answer
        isCorrect: Boolean,
        pointsEarned: Number,
      },
    ],
    score: {
      type: Number,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient querying
quizAttemptSchema.index({ resourceId: 1, userId: 1, completedAt: -1 })
quizAttemptSchema.index({ userId: 1, passed: 1 })

export default mongoose.model("QuizAttempt", quizAttemptSchema)
