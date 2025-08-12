"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Zap } from "lucide-react"
import { apiService, type ActivitySummary } from "@/lib/api"

export function Lifestyle3DSphere() {
  const [activityData, setActivityData] = useState<ActivitySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [rotation, setRotation] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    loadActivityData()
    startAnimation()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const startAnimation = () => {
    const animate = () => {
      setRotation((prev) => (prev + 0.5) % 360)
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
  }

  const loadActivityData = async () => {
    try {
      setLoading(true)
      const response = await apiService.getActivitySummary("month")
      setActivityData(response.data)
    } catch (error) {
      console.error("Failed to load activity data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activityData && canvasRef.current) {
      draw3DSphere()
    }
  }, [activityData, rotation])

  const draw3DSphere = () => {
    const canvas = canvasRef.current
    if (!canvas || !activityData) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.35

    ctx.clearRect(0, 0, width, height)

    // Background gradient
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2)
    bgGradient.addColorStop(0, "rgba(16, 185, 129, 0.1)")
    bgGradient.addColorStop(1, "rgba(16, 185, 129, 0.02)")
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // Calculate activity metrics
    const exerciseScore = Math.min(activityData.exercise.totalSessions * 10, 100)
    const dietScore = Math.min((activityData.diet.totalEntries / 30) * 100, 100)
    const weightScore = activityData.weight.trend === "stable" ? 100 : activityData.weight.trend === "losing" ? 80 : 60
    const stressScore = Math.max(100 - activityData.stress.averageLevel * 10, 0)

    // Draw main sphere with gradient
    const sphereGradient = ctx.createRadialGradient(
      centerX - radius * 0.3,
      centerY - radius * 0.3,
      0,
      centerX,
      centerY,
      radius,
    )
    sphereGradient.addColorStop(0, "#34d399")
    sphereGradient.addColorStop(0.7, "#10b981")
    sphereGradient.addColorStop(1, "#047857")

    ctx.fillStyle = sphereGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fill()

    // Draw rotating activity segments
    const segments = [
      { label: "Exercise", score: exerciseScore, color: "#3b82f6", angle: 0 },
      { label: "Diet", score: dietScore, color: "#f59e0b", angle: 90 },
      { label: "Weight", score: weightScore, color: "#8b5cf6", angle: 180 },
      { label: "Stress", score: stressScore, color: "#ef4444", angle: 270 },
    ]

    segments.forEach((segment, index) => {
      const angle = ((segment.angle + rotation) * Math.PI) / 180
      const segmentRadius = radius * 0.3 + (segment.score / 100) * radius * 0.4
      const x = centerX + Math.cos(angle) * (radius * 0.8)
      const y = centerY + Math.sin(angle) * (radius * 0.8)

      // Draw segment sphere
      const segmentGradient = ctx.createRadialGradient(
        x - segmentRadius * 0.3,
        y - segmentRadius * 0.3,
        0,
        x,
        y,
        segmentRadius,
      )
      segmentGradient.addColorStop(0, segment.color + "CC")
      segmentGradient.addColorStop(1, segment.color + "66")

      ctx.fillStyle = segmentGradient
      ctx.beginPath()
      ctx.arc(x, y, segmentRadius, 0, 2 * Math.PI)
      ctx.fill()

      // Draw connecting line
      ctx.strokeStyle = segment.color + "44"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()

      // Add score text
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 12px system-ui"
      ctx.textAlign = "center"
      ctx.fillText(`${Math.round(segment.score)}`, x, y + 4)
    })

    // Draw center text
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 16px system-ui"
    ctx.textAlign = "center"
    ctx.fillText("Health", centerX, centerY - 5)
    ctx.font = "12px system-ui"
    ctx.fillText("Score", centerX, centerY + 10)

    // Add floating particles for visual effect
    const particleCount = 20
    for (let i = 0; i < particleCount; i++) {
      const particleAngle = ((i * 18 + rotation * 2) * Math.PI) / 180
      const particleDistance = radius * 1.2 + Math.sin(rotation * 0.1 + i) * 20
      const px = centerX + Math.cos(particleAngle) * particleDistance
      const py = centerY + Math.sin(particleAngle) * particleDistance

      ctx.fillStyle = `rgba(16, 185, 129, ${0.3 + Math.sin(rotation * 0.05 + i) * 0.2})`
      ctx.beginPath()
      ctx.arc(px, py, 2, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-emerald-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="font-heading font-bold text-slate-800 text-xl">3D Health Sphere</CardTitle>
            <CardDescription className="text-slate-600">Interactive lifestyle metrics visualization</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas ref={canvasRef} className="w-full h-80 rounded-xl" style={{ background: "transparent" }} />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <Zap className="w-6 h-6 animate-pulse text-emerald-600" />
                <span className="font-medium">Loading health metrics...</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
            <div className="text-sm font-medium text-slate-700">Exercise</div>
            <div className="text-xs text-slate-500">Sessions</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="w-4 h-4 bg-amber-500 rounded-full mx-auto mb-2"></div>
            <div className="text-sm font-medium text-slate-700">Diet</div>
            <div className="text-xs text-slate-500">Tracking</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="w-4 h-4 bg-purple-500 rounded-full mx-auto mb-2"></div>
            <div className="text-sm font-medium text-slate-700">Weight</div>
            <div className="text-xs text-slate-500">Stability</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
            <div className="text-sm font-medium text-slate-700">Stress</div>
            <div className="text-xs text-slate-500">Management</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
