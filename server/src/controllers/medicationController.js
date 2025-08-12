import Medication from "../models/Medication.js"
import MedicationLog from "../models/MedicationLog.js"
import { validationResult } from "express-validator"

export const createMedication = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const medication = new Medication({
      ...req.body,
      userId: req.user._id,
    })

    await medication.save()

    res.status(201).json({
      success: true,
      message: "Medication created successfully",
      data: medication,
    })
  } catch (error) {
    console.error("Create medication error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getMedications = async (req, res) => {
  try {
    const { active } = req.query
    const query = { userId: req.user._id }

    if (active !== undefined) {
      query.active = active === "true"
    }

    const medications = await Medication.find(query).sort({ createdAt: -1 })

    res.json({
      success: true,
      data: medications,
    })
  } catch (error) {
    console.error("Get medications error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getMedication = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      })
    }

    res.json({
      success: true,
      data: medication,
    })
  } catch (error) {
    console.error("Get medication error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const updateMedication = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const medication = await Medication.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
      new: true,
      runValidators: true,
    })

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      })
    }

    res.json({
      success: true,
      message: "Medication updated successfully",
      data: medication,
    })
  } catch (error) {
    console.error("Update medication error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { active: false },
      { new: true },
    )

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      })
    }

    res.json({
      success: true,
      message: "Medication deactivated successfully",
    })
  } catch (error) {
    console.error("Delete medication error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const logMedicationTaken = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user._id,
      active: true,
    })

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      })
    }

    const log = new MedicationLog({
      userId: req.user._id,
      medicationId: req.params.id,
      takenAt: req.body.takenAt || new Date(),
      notes: req.body.notes,
    })

    await log.save()

    res.status(201).json({
      success: true,
      message: "Medication dose logged successfully",
      data: log,
    })
  } catch (error) {
    console.error("Log medication error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getMedicationLogs = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, page = 1 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const query = {
      userId: req.user._id,
      medicationId: req.params.id,
    }

    if (startDate || endDate) {
      query.takenAt = {}
      if (startDate) query.takenAt.$gte = new Date(startDate)
      if (endDate) query.takenAt.$lte = new Date(endDate)
    }

    const logs = await MedicationLog.find(query)
      .populate("medicationId", "name dosage")
      .sort({ takenAt: -1 })
      .limit(Number.parseInt(limit))
      .skip(skip)

    const total = await MedicationLog.countDocuments(query)

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get medication logs error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getUpcomingRefills = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const medications = await Medication.find({
      userId: req.user._id,
      active: true,
      "refillInfo.refillDate": {
        $lte: thirtyDaysFromNow,
        $gte: new Date(),
      },
    }).sort({ "refillInfo.refillDate": 1 })

    res.json({
      success: true,
      data: medications,
    })
  } catch (error) {
    console.error("Get upcoming refills error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
