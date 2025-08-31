import Resource from "../models/Resource.js"
import ResourceAssignment from "../models/ResourceAssignment.js"
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
      createdBy: providerId,
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
