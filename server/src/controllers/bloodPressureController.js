import BloodPressure from "../models/BloodPressure.js"
import { validationResult } from "express-validator"

export const createReading = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { systolic, diastolic, pulse, timestamp, notes, location, position, arm } = req.body

    const reading = new BloodPressure({
      userId: req.user._id,
      systolic,
      diastolic,
      pulse,
      timestamp: timestamp || new Date(),
      notes,
      location,
      position,
      arm,
    })

    await reading.save()

    res.status(201).json({
      success: true,
      message: "Blood pressure reading created successfully",
      data: reading,
    })
  } catch (error) {
    console.error("Create reading error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getReadings = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { startDate, endDate, limit = 20, page = 1, abnormalOnly } = req.query

    // Build query
    const query = { userId: req.user._id }

    if (startDate || endDate) {
      query.timestamp = {}
      if (startDate) query.timestamp.$gte = new Date(startDate)
      if (endDate) query.timestamp.$lte = new Date(endDate)
    }

    if (abnormalOnly === "true") {
      query.isAbnormal = true
    }

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Execute query
    const readings = await BloodPressure.find(query).sort({ timestamp: -1 }).limit(Number.parseInt(limit)).skip(skip)

    const total = await BloodPressure.countDocuments(query)

    res.json({
      success: true,
      data: {
        readings,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get readings error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getReading = async (req, res) => {
  try {
    const reading = await BloodPressure.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Reading not found",
      })
    }

    res.json({
      success: true,
      data: reading,
    })
  } catch (error) {
    console.error("Get reading error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const updateReading = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const reading = await BloodPressure.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
      new: true,
      runValidators: true,
    })

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Reading not found",
      })
    }

    res.json({
      success: true,
      message: "Reading updated successfully",
      data: reading,
    })
  } catch (error) {
    console.error("Update reading error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const deleteReading = async (req, res) => {
  try {
    const reading = await BloodPressure.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Reading not found",
      })
    }

    res.json({
      success: true,
      message: "Reading deleted successfully",
    })
  } catch (error) {
    console.error("Delete reading error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getReadingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const userId = req.user._id

    // Build date filter
    const dateFilter = { userId }
    if (startDate || endDate) {
      dateFilter.timestamp = {}
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate)
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate)
    }

    // Aggregate statistics
    const stats = await BloodPressure.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          avgSystolic: { $avg: "$systolic" },
          avgDiastolic: { $avg: "$diastolic" },
          avgPulse: { $avg: "$pulse" },
          maxSystolic: { $max: "$systolic" },
          maxDiastolic: { $max: "$diastolic" },
          minSystolic: { $min: "$systolic" },
          minDiastolic: { $min: "$diastolic" },
          totalReadings: { $sum: 1 },
          abnormalReadings: {
            $sum: { $cond: ["$isAbnormal", 1, 0] },
          },
        },
      },
    ])

    const result = stats[0] || {
      avgSystolic: 0,
      avgDiastolic: 0,
      avgPulse: 0,
      maxSystolic: 0,
      maxDiastolic: 0,
      minSystolic: 0,
      minDiastolic: 0,
      totalReadings: 0,
      abnormalReadings: 0,
    }

    res.json({
      success: true,
      data: {
        ...result,
        abnormalPercentage:
          result.totalReadings > 0 ? ((result.abnormalReadings / result.totalReadings) * 100).toFixed(1) : 0,
      },
    })
  } catch (error) {
    console.error("Get reading stats error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getAbnormalReadings = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const readings = await BloodPressure.find({
      userId: req.user._id,
      isAbnormal: true,
    })
      .sort({ timestamp: -1 })
      .limit(Number.parseInt(limit))
      .skip(skip)

    const total = await BloodPressure.countDocuments({
      userId: req.user._id,
      isAbnormal: true,
    })

    res.json({
      success: true,
      data: {
        readings,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get abnormal readings error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
