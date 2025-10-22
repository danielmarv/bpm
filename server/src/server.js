import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import rateLimit from "express-rate-limit"
import swaggerUi from "swagger-ui-express"
import swaggerJsdoc from "swagger-jsdoc"
import dotenv from "dotenv"

// Import routes
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import bpRoutes from "./routes/bloodPressure.js"
import medicationRoutes from "./routes/medications.js"
import medicationTemplateRoutes from "./routes/medicationTemplates.js"
import messageRoutes from "./routes/messages.js"
import activityRoutes from "./routes/activities.js"
import resourceRoutes from "./routes/resources.js"

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js"
import { notFound } from "./middleware/notFound.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors("*"))


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use("/api/", limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(compression())

// Logging
app.use(morgan("combined"))

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BP Health Tracking API",
      version: "1.0.0",
      description: "Blood Pressure Management and Health Tracking System API",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
}

const specs = swaggerJsdoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/blood-pressure", bpRoutes)
app.use("/api/medications", medicationRoutes)
app.use("/api/medication-templates", medicationTemplateRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/activities", activityRoutes)
app.use("/api/resources", resourceRoutes)

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`)
    })
  })
  .catch((error) => {
    console.error("Database connection error:", error)
    process.exit(1)
  })

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed")
    process.exit(0)
  })
})
