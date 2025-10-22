import Medication from "../models/Medication.js"
import MedicationTemplate from "../models/MedicationTemplate.js"
import MedicationLog from "../models/MedicationLog.js"
import User from "../models/User.js"
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

export const prescribeMedication = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { patientId } = req.params
    const providerId = req.user._id

    // Verify the patient exists and was created by this provider
    const patient = await User.findOne({
      _id: patientId,
      role: "patient",
      createdBy: providerId,
      isActive: true,
    })

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found or not under your care",
      })
    }

    const medication = new Medication({
      ...req.body,
      userId: patientId,
      prescribedById: providerId,
      prescribedBy: {
        name: `${req.user.profile.firstName} ${req.user.profile.lastName}`,
        contact: req.user.email,
      },
    })

    await medication.save()

    // Populate the medication with patient and provider info
    await medication.populate([
      { path: "userId", select: "profile.firstName profile.lastName email" },
      { path: "prescribedById", select: "profile.firstName profile.lastName email" },
    ])

    res.status(201).json({
      success: true,
      message: "Medication prescribed successfully",
      data: medication,
    })
  } catch (error) {
    console.error("Prescribe medication error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getMyPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, patientId, active } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const query = { prescribedById: req.user._id }

    if (patientId) {
      query.userId = patientId
    }

    if (active !== undefined) {
      query.active = active === "true"
    }

    const medications = await Medication.find(query)
      .populate("userId", "profile.firstName profile.lastName email")
      .sort({ createdAt: -1 })
      .limit(Number.parseInt(limit))
      .skip(skip)

    const total = await Medication.countDocuments(query)

    res.json({
      success: true,
      data: {
        medications,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get my prescriptions error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getPatientMedications = async (req, res) => {
  try {
    const { patientId } = req.params
    const { active } = req.query

    // Verify the patient is under this provider's care
    const patient = await User.findOne({
      _id: patientId,
      role: "patient",
      createdBy: req.user._id,
      isActive: true,
    })

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found or not under your care",
      })
    }

    const query = { userId: patientId }
    if (active !== undefined) {
      query.active = active === "true"
    }

    const medications = await Medication.find(query)
      .populate("prescribedById", "profile.firstName profile.lastName email")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: medications,
    })
  } catch (error) {
    console.error("Get patient medications error:", error)
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

    const medications = await Medication.find(query)
      .populate("prescribedById", "profile.firstName profile.lastName email")
      .sort({ createdAt: -1 })

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

// Create medication from template (Patient)
export const createMedicationFromTemplate = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { templateId } = req.params
    const { startDate, endDate, customizations } = req.body

    // Find the template
    const template = await MedicationTemplate.findOne({
      _id: templateId,
      $or: [
        { isPublic: true, approvalStatus: "approved" },
        { providerId: req.user.createdBy }, // Template from user's provider
      ],
      isActive: true,
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Medication template not found or not accessible",
      })
    }

    // Calculate end date if not provided and template has default duration
    let calculatedEndDate = endDate
    if (!endDate && template.defaultDuration) {
      const start = new Date(startDate)
      switch (template.defaultDuration.unit) {
        case "days":
          calculatedEndDate = new Date(start.getTime() + template.defaultDuration.amount * 24 * 60 * 60 * 1000)
          break
        case "weeks":
          calculatedEndDate = new Date(start.getTime() + template.defaultDuration.amount * 7 * 24 * 60 * 60 * 1000)
          break
        case "months":
          calculatedEndDate = new Date(start)
          calculatedEndDate.setMonth(calculatedEndDate.getMonth() + template.defaultDuration.amount)
          break
        case "years":
          calculatedEndDate = new Date(start)
          calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + template.defaultDuration.amount)
          break
      }
    }

    // Create medication from template
    const medicationData = {
      userId: req.user._id,
      name: customizations?.name || template.name,
      dosage: customizations?.dosage || template.dosage,
      frequency: customizations?.frequency || template.frequency,
      customSchedule: customizations?.customSchedule || template.customSchedule,
      startDate: startDate,
      endDate: calculatedEndDate,
      instructions: customizations?.instructions || template.instructions,
      sideEffects: template.commonSideEffects || [],
      reminderSchedule: customizations?.reminderSchedule || {
        enabled: true,
        times: ["08:00"], // Default reminder time
        daysOfWeek: [1, 2, 3, 4, 5, 6, 7], // All days
      },
      templateId: template._id,
      prescribedById: template.providerId,
      prescribedBy: {
        name: `${template.provider?.profile?.firstName || ''} ${template.provider?.profile?.lastName || ''}`.trim(),
        contact: template.provider?.email || '',
      },
    }

    const medication = new Medication(medicationData)
    await medication.save()

    // Increment template usage count
    await template.incrementUsage()

    // Populate the medication
    await medication.populate([
      { path: "userId", select: "profile.firstName profile.lastName email" },
      { path: "prescribedById", select: "profile.firstName profile.lastName email" },
    ])

    res.status(201).json({
      success: true,
      message: "Medication created from template successfully",
      data: medication,
    })
  } catch (error) {
    console.error("Create medication from template error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// Prescribe medication from template (Provider)
export const prescribeMedicationFromTemplate = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { patientId, templateId } = req.params
    const { startDate, endDate, customizations } = req.body
    const providerId = req.user._id

    // Verify the patient exists and was created by this provider
    const patient = await User.findOne({
      _id: patientId,
      role: "patient",
      createdBy: providerId,
      isActive: true,
    })

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found or not under your care",
      })
    }

    // Find the template (must be accessible to this provider)
    const template = await MedicationTemplate.findOne({
      _id: templateId,
      $or: [
        { providerId: providerId }, // Own template
        { isPublic: true, approvalStatus: "approved" }, // Approved public template
      ],
      isActive: true,
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Medication template not found or not accessible",
      })
    }

    // Calculate end date if not provided and template has default duration
    let calculatedEndDate = endDate
    if (!endDate && template.defaultDuration) {
      const start = new Date(startDate)
      switch (template.defaultDuration.unit) {
        case "days":
          calculatedEndDate = new Date(start.getTime() + template.defaultDuration.amount * 24 * 60 * 60 * 1000)
          break
        case "weeks":
          calculatedEndDate = new Date(start.getTime() + template.defaultDuration.amount * 7 * 24 * 60 * 60 * 1000)
          break
        case "months":
          calculatedEndDate = new Date(start)
          calculatedEndDate.setMonth(calculatedEndDate.getMonth() + template.defaultDuration.amount)
          break
        case "years":
          calculatedEndDate = new Date(start)
          calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + template.defaultDuration.amount)
          break
      }
    }

    // Create medication from template
    const medicationData = {
      userId: patientId,
      name: customizations?.name || template.name,
      dosage: customizations?.dosage || template.dosage,
      frequency: customizations?.frequency || template.frequency,
      customSchedule: customizations?.customSchedule || template.customSchedule,
      startDate: startDate,
      endDate: calculatedEndDate,
      instructions: customizations?.instructions || template.instructions,
      sideEffects: template.commonSideEffects || [],
      templateId: template._id,
      prescribedById: providerId,
      prescribedBy: {
        name: `${req.user.profile.firstName} ${req.user.profile.lastName}`,
        contact: req.user.email,
      },
    }

    const medication = new Medication(medicationData)
    await medication.save()

    // Increment template usage count
    await template.incrementUsage()

    // Populate the medication
    await medication.populate([
      { path: "userId", select: "profile.firstName profile.lastName email" },
      { path: "prescribedById", select: "profile.firstName profile.lastName email" },
    ])

    res.status(201).json({
      success: true,
      message: "Medication prescribed from template successfully",
      data: medication,
    })
  } catch (error) {
    console.error("Prescribe medication from template error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// Get available templates for a patient
export const getAvailableTemplatesForPatient = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const filters = {}
    if (category) filters.category = category
    if (search) {
      filters.$text = { $search: search }
    }

    // Get templates from patient's provider and public approved templates
    const query = {
      $or: [
        { providerId: req.user.createdBy }, // Templates from patient's provider
        { isPublic: true, approvalStatus: "approved" }, // Approved public templates
      ],
      isActive: true,
      ...filters,
    }

    const templates = await MedicationTemplate.find(query)
      .populate("providerId", "profile.firstName profile.lastName")
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)

    const total = await MedicationTemplate.countDocuments(query)

    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get available templates error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
