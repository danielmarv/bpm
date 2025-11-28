import Resource from "../models/Resource.js"
import ResourceAssignment from "../models/ResourceAssignment.js"
import QuizAttempt from "../models/QuizAttempt.js"
import User from "../models/User.js"
import { validationResult } from "express-validator"

export const createResource = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const resource = new Resource({
      ...req.body,
      createdBy: req.user._id,
    })

    await resource.save()

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: resource,
    })
  } catch (error) {
    console.error("Create resource error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getResources = async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const query = { published: true }

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const resources = await Resource.find(query)
      .populate("createdBy", "profile.firstName profile.lastName role")
      .sort({ createdAt: -1 })
      .limit(Number.parseInt(limit))
      .skip(skip)

    const total = await Resource.countDocuments(query)

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get resources error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "createdBy",
      "profile.firstName profile.lastName role",
    )

    if (!resource || !resource.published) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    // Increment view count
    resource.views += 1
    await resource.save()

    res.json({
      success: true,
      data: resource,
    })
  } catch (error) {
    console.error("Get resource error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const updateResource = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true },
    )

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    res.json({
      success: true,
      message: "Resource updated successfully",
      data: resource,
    })
  } catch (error) {
    console.error("Update resource error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id)

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    res.json({
      success: true,
      message: "Resource deleted successfully",
    })
  } catch (error) {
    console.error("Delete resource error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getResourceCategories = async (req, res) => {
  try {
    const categories = await Resource.distinct("category", { published: true })

    res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Get resource categories error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const assignResourceToPatient = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { resourceId, patientId } = req.params
    const { notes, priority, dueDate } = req.body
    const providerId = req.user._id

    // Verify the resource exists and is published
    const resource = await Resource.findOne({ _id: resourceId, published: true })
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    // Verify the patient exists and is under this provider's care
    const patient = await User.findOne({
      _id: patientId,
      role: "patient",
      isActive: true,
    })

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found or not under your care",
      })
    }

    // Check if resource is already assigned to this patient
    const existingAssignment = await ResourceAssignment.findOne({
      resourceId,
      patientId,
    })

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "Resource already assigned to this patient",
      })
    }

    const assignment = new ResourceAssignment({
      resourceId,
      patientId,
      providerId,
      notes,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    })

    await assignment.save()

    // Populate the assignment with resource and patient info
    await assignment.populate([
      { path: "resourceId", select: "title category metadata.difficulty" },
      { path: "patientId", select: "profile.firstName profile.lastName email" },
    ])

    res.status(201).json({
      success: true,
      message: "Resource assigned to patient successfully",
      data: assignment,
    })
  } catch (error) {
    console.error("Assign resource error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getMyAssignedResources = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const query = { patientId: req.user._id }

    if (status) {
      query.status = status
    }

    let assignments = await ResourceAssignment.find(query)
      .populate({
        path: "resourceId",
        match: category ? { category } : {},
        select: "title content category tags metadata views",
      })
      .populate("providerId", "profile.firstName profile.lastName email")
      .sort({ assignedAt: -1 })
      .limit(Number.parseInt(limit))
      .skip(skip)

    // Filter out assignments where resource doesn't match category filter
    assignments = assignments.filter((assignment) => assignment.resourceId)

    const total = await ResourceAssignment.countDocuments(query)

    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get assigned resources error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getMyResourceAssignments = async (req, res) => {
  try {
    const { patientId, status, page = 1, limit = 20 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const query = { providerId: req.user._id }

    if (patientId) {
      query.patientId = patientId
    }

    if (status) {
      query.status = status
    }

    const assignments = await ResourceAssignment.find(query)
      .populate("resourceId", "title category metadata.difficulty")
      .populate("patientId", "profile.firstName profile.lastName email")
      .sort({ assignedAt: -1 })
      .limit(Number.parseInt(limit))
      .skip(skip)

    const total = await ResourceAssignment.countDocuments(query)

    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get resource assignments error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const updateResourceStatus = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { assignmentId } = req.params
    const { status } = req.body

    const assignment = await ResourceAssignment.findOne({
      _id: assignmentId,
      patientId: req.user._id,
    })

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Resource assignment not found",
      })
    }

    const updateData = { status }

    if (status === "viewed" && !assignment.viewedAt) {
      updateData.viewedAt = new Date()
    }

    if (status === "completed") {
      updateData.completedAt = new Date()
      if (!assignment.viewedAt) {
        updateData.viewedAt = new Date()
      }
    }

    const updatedAssignment = await ResourceAssignment.findByIdAndUpdate(assignmentId, updateData, {
      new: true,
    }).populate([
      { path: "resourceId", select: "title category" },
      { path: "providerId", select: "profile.firstName profile.lastName" },
    ])

    res.json({
      success: true,
      message: "Resource status updated successfully",
      data: updatedAssignment,
    })
  } catch (error) {
    console.error("Update resource status error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const removeResourceAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params

    const assignment = await ResourceAssignment.findOne({
      _id: assignmentId,
      providerId: req.user._id,
    })

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Resource assignment not found",
      })
    }

    await ResourceAssignment.findByIdAndDelete(assignmentId)

    res.json({
      success: true,
      message: "Resource assignment removed successfully",
    })
  } catch (error) {
    console.error("Remove resource assignment error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

/**
 * Quiz Management
 */

export const createOrUpdateQuiz = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { id } = req.params
    const { enabled, passingScore, questions } = req.body

    const resource = await Resource.findById(id)
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    // Validate questions structure
    if (questions && questions.length > 0) {
      for (const q of questions) {
        if (q.type === "multiple_choice" && (!q.options || q.options.length < 2)) {
          return res.status(400).json({
            success: false,
            message: "Multiple choice questions must have at least 2 options",
          })
        }
        if (!q.correctAnswer && (!q.acceptableAnswers || q.acceptableAnswers.length === 0)) {
          return res.status(400).json({
            success: false,
            message: "Each question must have at least one correct answer",
          })
        }
      }
    }

    resource.quiz = {
      enabled: enabled !== undefined ? enabled : resource.quiz?.enabled || false,
      passingScore: passingScore || resource.quiz?.passingScore || 70,
      questions: questions || resource.quiz?.questions || [],
    }

    await resource.save()

    res.json({
      success: true,
      message: "Quiz updated successfully",
      data: resource.quiz,
    })
  } catch (error) {
    console.error("Create/update quiz error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getQuiz = async (req, res) => {
  try {
    const { id } = req.params

    const resource = await Resource.findById(id).select("title quiz")
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    if (!resource.quiz || !resource.quiz.enabled) {
      return res.status(404).json({
        success: false,
        message: "No quiz available for this resource",
      })
    }

    // Strip correct answers for client (only show questions and options)
    const sanitizedQuiz = {
      enabled: resource.quiz.enabled,
      passingScore: resource.quiz.passingScore,
      questions: resource.quiz.questions.map((q) => ({
        _id: q._id,
        type: q.type,
        question: q.question,
        points: q.points,
        options: q.options,
        // Don't send correctAnswer or acceptableAnswers to client
      })),
    }

    res.json({
      success: true,
      data: {
        resourceTitle: resource.title,
        quiz: sanitizedQuiz,
      },
    })
  } catch (error) {
    console.error("Get quiz error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params
    const { answers } = req.body
    const userId = req.user._id

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      })
    }

    const resource = await Resource.findById(id)
    if (!resource || !resource.quiz || !resource.quiz.enabled) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found or not enabled",
      })
    }

    const quiz = resource.quiz
    let totalPoints = 0
    let earnedPoints = 0
    const gradedAnswers = []

    // Grade each answer
    for (const question of quiz.questions) {
      totalPoints += question.points || 1

      const userAnswer = answers.find((a) => a.questionId === question._id.toString())
      if (!userAnswer) {
        gradedAnswers.push({
          questionId: question._id,
          userAnswer: null,
          isCorrect: false,
          pointsEarned: 0,
        })
        continue
      }

      let isCorrect = false

      if (question.type === "multiple_choice") {
        isCorrect = userAnswer.answer === question.correctAnswer
      } else if (question.type === "short_answer") {
        const userAnswerText = (userAnswer.answer || "").trim()
        const acceptableAnswers = question.acceptableAnswers || [question.correctAnswer]

        if (question.caseSensitive) {
          isCorrect = acceptableAnswers.some((ans) => ans === userAnswerText)
        } else {
          isCorrect = acceptableAnswers.some(
            (ans) => ans.toLowerCase() === userAnswerText.toLowerCase(),
          )
        }
      }

      const pointsEarned = isCorrect ? question.points || 1 : 0
      earnedPoints += pointsEarned

      gradedAnswers.push({
        questionId: question._id,
        userAnswer: userAnswer.answer,
        isCorrect,
        pointsEarned,
      })
    }

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = percentage >= quiz.passingScore

    // Save attempt
    const attempt = new QuizAttempt({
      resourceId: id,
      userId,
      answers: gradedAnswers,
      score: earnedPoints,
      totalPoints,
      percentage,
      passed,
    })

    await attempt.save()

    res.json({
      success: true,
      message: passed ? "Quiz passed!" : "Quiz completed",
      data: {
        attemptId: attempt._id,
        score: earnedPoints,
        totalPoints,
        percentage,
        passed,
        passingScore: quiz.passingScore,
        answers: gradedAnswers,
      },
    })
  } catch (error) {
    console.error("Submit quiz error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getQuizAttempts = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const attempts = await QuizAttempt.find({
      resourceId: id,
      userId,
    })
      .sort({ completedAt: -1 })
      .limit(10)

    res.json({
      success: true,
      data: attempts,
    })
  } catch (error) {
    console.error("Get quiz attempts error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
