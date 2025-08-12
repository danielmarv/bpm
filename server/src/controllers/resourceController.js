import Resource from "../models/Resource.js"
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
