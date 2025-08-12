import Activity from "../models/Activity.js"
import { validationResult } from "express-validator"

export const createActivity = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const activity = new Activity({
      ...req.body,
      userId: req.user._id,
    })

    await activity.save()

    res.status(201).json({
      success: true,
      message: "Activity logged successfully",
      data: activity,
    })
  } catch (error) {
    console.error("Create activity error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getActivities = async (req, res) => {
  try {
    const { type, startDate, endDate, limit = 20, page = 1 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const query = { userId: req.user._id }

    if (type) {
      query.type = type
    }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    const activities = await Activity.find(query).sort({ date: -1 }).limit(Number.parseInt(limit)).skip(skip)

    const total = await Activity.countDocuments(query)

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get activities error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getActivity = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      })
    }

    res.json({
      success: true,
      data: activity,
    })
  } catch (error) {
    console.error("Get activity error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const updateActivity = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const activity = await Activity.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
      new: true,
      runValidators: true,
    })

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      })
    }

    res.json({
      success: true,
      message: "Activity updated successfully",
      data: activity,
    })
  } catch (error) {
    console.error("Update activity error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      })
    }

    res.json({
      success: true,
      message: "Activity deleted successfully",
    })
  } catch (error) {
    console.error("Delete activity error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query
    const userId = req.user._id

    const dateFilter = { userId }
    if (type) dateFilter.type = type
    if (startDate || endDate) {
      dateFilter.date = {}
      if (startDate) dateFilter.date.$gte = new Date(startDate)
      if (endDate) dateFilter.date.$lte = new Date(endDate)
    }

    const stats = await Activity.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          avgDuration: { $avg: "$data.duration" },
          totalCalories: { $sum: "$data.calories" },
          avgWeight: { $avg: "$data.weight" },
        },
      },
    ])

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Get activity stats error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
