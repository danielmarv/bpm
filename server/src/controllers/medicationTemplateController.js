import MedicationTemplate from "../models/MedicationTemplate.js"
import User from "../models/User.js"
import { validationResult } from "express-validator"

// Create a new medication template (Provider only)
export const createMedicationTemplate = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const template = new MedicationTemplate({
      ...req.body,
      providerId: req.user._id,
    })

    await template.save()
    await template.populate("providerId", "profile.firstName profile.lastName email")

    res.status(201).json({
      success: true,
      message: "Medication template created successfully",
      data: template,
    })
  } catch (error) {
    console.error("Create medication template error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// Get medication templates for a provider
export const getProviderTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, isActive } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const filters = {}
    if (category) filters.category = category
    if (search) {
      filters.$text = { $search: search }
    }
    if (isActive !== undefined) filters.isActive = isActive === "true"

    const templates = await MedicationTemplate.findAccessibleToProvider(req.user._id, filters)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)

    const total = await MedicationTemplate.countDocuments({
      $or: [
        { providerId: req.user._id },
        { isPublic: true, approvalStatus: "approved" },
      ],
      isActive: true,
      ...filters,
    })

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
    console.error("Get provider templates error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// Get public medication templates (for patients to browse)
export const getPublicTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const filters = {}
    if (category) filters.category = category
    if (search) {
      filters.$text = { $search: search }
    }

    const templates = await MedicationTemplate.findPublicTemplates(filters)
      .sort({ usageCount: -1, createdAt: -1 }) // Popular first
      .limit(parseInt(limit))
      .skip(skip)

    const total = await MedicationTemplate.countDocuments({
      isPublic: true,
      approvalStatus: "approved",
      isActive: true,
      ...filters,
    })

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
    console.error("Get public templates error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// Get a single medication template by ID
export const getMedicationTemplate = async (req, res) => {
  try {
    const template = await MedicationTemplate.findOne({
      _id: req.params.id,
      $or: [
        { providerId: req.user._id },
        { isPublic: true, approvalStatus: "approved" },
      ],
      isActive: true,
    }).populate("providerId", "profile.firstName profile.lastName email")

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Medication template not found",
      })
    }

    res.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error("Get medication template error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// Update a medication template (Provider only - own templates)
export const updateMedicationTemplate = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const template = await MedicationTemplate.findOneAndUpdate(
      { 
        _id: req.params.id, 
        providerId: req.user._id 
      },
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate("providerId", "profile.firstName profile.lastName email")

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Medication template not found or you don't have permission to update it",
      })
    }

    res.json({
      success: true,
      message: "Medication template updated successfully",
      data: template,
    })
  } catch (error) {
    console.error("Update medication template error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// Delete (deactivate) a medication template (Provider only - own templates)
export const deleteMedicationTemplate = async (req, res) => {
  try {
    const template = await MedicationTemplate.findOneAndUpdate(
      { 
        _id: req.params.id, 
        providerId: req.user._id 
      },
      { isActive: false },
      { new: true }
    )

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Medication template not found or you don't have permission to delete it",
      })
    }

    res.json({
      success: true,
      message: "Medication template deleted successfully",
    })
  } catch (error) {
    console.error("Delete medication template error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// Get template categories
export const getTemplateCategories = async (req, res) => {
  try {
    const categories = [
      { value: "hypertension", label: "Hypertension", icon: "heart" },
      { value: "diabetes", label: "Diabetes", icon: "droplet" },
      { value: "heart_disease", label: "Heart Disease", icon: "heart" },
      { value: "cholesterol", label: "Cholesterol", icon: "trending-up" },
      { value: "anxiety", label: "Anxiety", icon: "brain" },
      { value: "depression", label: "Depression", icon: "brain" },
      { value: "pain_relief", label: "Pain Relief", icon: "zap" },
      { value: "antibiotics", label: "Antibiotics", icon: "shield" },
      { value: "vitamins", label: "Vitamins & Supplements", icon: "plus" },
      { value: "other", label: "Other", icon: "more-horizontal" },
    ]

    res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Get template categories error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// Approve a public template (Admin only)
export const approvePublicTemplate = async (req, res) => {
  try {
    const { action } = req.body // "approve" or "reject"
    
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'approve' or 'reject'",
      })
    }

    const updateData = {
      approvalStatus: action === "approve" ? "approved" : "rejected",
      approvedBy: req.user._id,
      approvedAt: new Date(),
    }

    const template = await MedicationTemplate.findOneAndUpdate(
      { 
        _id: req.params.id,
        isPublic: true,
        approvalStatus: "pending"
      },
      updateData,
      { new: true }
    ).populate("providerId", "profile.firstName profile.lastName email")

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found or not pending approval",
      })
    }

    res.json({
      success: true,
      message: `Template ${action}d successfully`,
      data: template,
    })
  } catch (error) {
    console.error("Approve template error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// Get pending templates for approval (Admin only)
export const getPendingTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const templates = await MedicationTemplate.find({
      isPublic: true,
      approvalStatus: "pending",
      isActive: true,
    })
      .populate("providerId", "profile.firstName profile.lastName email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)

    const total = await MedicationTemplate.countDocuments({
      isPublic: true,
      approvalStatus: "pending",
      isActive: true,
    })

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
    console.error("Get pending templates error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
