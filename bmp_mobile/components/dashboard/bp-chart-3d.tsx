"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, RotateCcw } from "lucide-react"
import { apiService, type BloodPressureReading } from "@/lib/api"

export function BPChart3D() {
  const [readings, setReadings] = useState<BloodPressureReading[]>([])
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month")
  const [loading, setLoading] = useState(true)
  const [rotation, setRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    loadReadings()
  }, [period])

  useEffect(() => {
    if (readings.length > 0 && canvasRef.current) {
      draw3DChart()
    }
  }, [readings, rotation])

  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setRotation((prev) => (prev + 1) % 360)
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating])

  const loadReadings = async () => {
    try {
      setLoading(true)
      const endDate = new Date()
      const startDate = new Date()

      switch (period) {
        case "week":
          startDate.setDate(endDate.getDate() - 7)
          break
        case "month":
          startDate.setMonth(endDate.getMonth() - 1)
          break
        case "quarter":
          startDate.setMonth(endDate.getMonth() - 3)
          break
      }

      const response = await apiService.getBPReadings({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 50,
      })
      setReadings(response.data.readings)
    } catch (error) {
      console.error("Failed to load readings:", error)
    } finally {
      setLoading(false)
    }
  }

  const draw3DChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    const padding = 50

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    if (readings.length === 0) return

    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 2,
    )
    gradient.addColorStop(0, "rgba(5, 150, 105, 0.15)")
    gradient.addColorStop(0.5, "rgba(5, 150, 105, 0.08)")
    gradient.addColorStop(1, "rgba(5, 150, 105, 0.02)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Calculate chart dimensions
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2
    const centerX = width / 2
    const centerY = height / 2

    // Find min/max values for scaling
    const systolicValues = readings.map((r) => r.systolic)
    const diastolicValues = readings.map((r) => r.diastolic)
    const minSystolic = Math.min(...systolicValues)
    const maxSystolic = Math.max(...systolicValues)
    const minDiastolic = Math.min(...diastolicValues)
    const maxDiastolic = Math.max(...diastolicValues)

    const perspective = 800
    const rotationRad = (rotation * Math.PI) / 180

    // Draw 3D grid background
    ctx.strokeStyle = "rgba(71, 85, 105, 0.1)"
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const y = padding + (i / 10) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }

    const barWidth = chartWidth / readings.length
    const maxBarHeight = chartHeight * 0.7

    readings.forEach((reading, index) => {
      const baseX = padding + index * barWidth
      const systolicHeight = ((reading.systolic - minSystolic) / (maxSystolic - minSystolic)) * maxBarHeight
      const diastolicHeight = ((reading.diastolic - minDiastolic) / (maxDiastolic - minDiastolic)) * maxBarHeight

      // 3D transformation
      const depth = 30
      const x3d = baseX + Math.cos(rotationRad) * depth
      const y3d = padding + chartHeight - systolicHeight + Math.sin(rotationRad) * depth * 0.5

      // Draw systolic bar with enhanced 3D effect
      const systolicGradient = ctx.createLinearGradient(x3d, y3d, x3d + barWidth * 0.4, y3d + systolicHeight)
      systolicGradient.addColorStop(0, "#34d399")
      systolicGradient.addColorStop(0.5, "#10b981")
      systolicGradient.addColorStop(1, "#059669")

      // Top face
      ctx.fillStyle = "#6ee7b7"
      ctx.beginPath()
      ctx.moveTo(baseX, padding + chartHeight - systolicHeight)
      ctx.lineTo(baseX + barWidth * 0.4, padding + chartHeight - systolicHeight)
      ctx.lineTo(x3d + barWidth * 0.4, y3d)
      ctx.lineTo(x3d, y3d)
      ctx.closePath()
      ctx.fill()

      // Front face
      ctx.fillStyle = systolicGradient
      ctx.fillRect(baseX, padding + chartHeight - systolicHeight, barWidth * 0.4, systolicHeight)

      // Side face
      ctx.fillStyle = "#059669"
      ctx.beginPath()
      ctx.moveTo(baseX + barWidth * 0.4, padding + chartHeight - systolicHeight)
      ctx.lineTo(x3d + barWidth * 0.4, y3d)
      ctx.lineTo(x3d + barWidth * 0.4, y3d + systolicHeight)
      ctx.lineTo(baseX + barWidth * 0.4, padding + chartHeight)
      ctx.closePath()
      ctx.fill()

      // Draw diastolic bar with enhanced 3D effect
      const diastolicX = baseX + barWidth * 0.5
      const diastolicX3d = diastolicX + Math.cos(rotationRad) * depth
      const diastolicY3d = padding + chartHeight - diastolicHeight + Math.sin(rotationRad) * depth * 0.5

      const diastolicGradient = ctx.createLinearGradient(
        diastolicX3d,
        diastolicY3d,
        diastolicX3d + barWidth * 0.4,
        diastolicY3d + diastolicHeight,
      )
      diastolicGradient.addColorStop(0, "#10b981")
      diastolicGradient.addColorStop(0.5, "#059669")
      diastolicGradient.addColorStop(1, "#047857")

      // Top face
      ctx.fillStyle = "#34d399"
      ctx.beginPath()
      ctx.moveTo(diastolicX, padding + chartHeight - diastolicHeight)
      ctx.lineTo(diastolicX + barWidth * 0.4, padding + chartHeight - diastolicHeight)
      ctx.lineTo(diastolicX3d + barWidth * 0.4, diastolicY3d)
      ctx.lineTo(diastolicX3d, diastolicY3d)
      ctx.closePath()
      ctx.fill()

      // Front face
      ctx.fillStyle = diastolicGradient
      ctx.fillRect(diastolicX, padding + chartHeight - diastolicHeight, barWidth * 0.4, diastolicHeight)

      // Side face
      ctx.fillStyle = "#047857"
      ctx.beginPath()
      ctx.moveTo(diastolicX + barWidth * 0.4, padding + chartHeight - diastolicHeight)
      ctx.lineTo(diastolicX3d + barWidth * 0.4, diastolicY3d)
      ctx.lineTo(diastolicX3d + barWidth * 0.4, diastolicY3d + diastolicHeight)
      ctx.lineTo(diastolicX + barWidth * 0.4, padding + chartHeight)
      ctx.closePath()
      ctx.fill()

      if (reading.isAbnormal) {
        const glowGradient = ctx.createRadialGradient(
          baseX + barWidth * 0.5,
          padding + 15,
          0,
          baseX + barWidth * 0.5,
          padding + 15,
          8,
        )
        glowGradient.addColorStop(0, "#f59e0b")
        glowGradient.addColorStop(0.5, "rgba(245, 158, 11, 0.5)")
        glowGradient.addColorStop(1, "rgba(245, 158, 11, 0)")

        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(baseX + barWidth * 0.5, padding + 15, 8, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = "#f59e0b"
        ctx.beginPath()
        ctx.arc(baseX + barWidth * 0.5, padding + 15, 4, 0, 2 * Math.PI)
        ctx.fill()
      }
    })

    if (readings.length > 1) {
      ctx.strokeStyle = "rgba(16, 185, 129, 0.8)"
      ctx.lineWidth = 3
      ctx.shadowColor = "rgba(16, 185, 129, 0.3)"
      ctx.shadowBlur = 5
      ctx.beginPath()

      readings.forEach((reading, index) => {
        const x = padding + index * barWidth + barWidth * 0.2
        const y =
          padding + chartHeight - ((reading.systolic - minSystolic) / (maxSystolic - minSystolic)) * maxBarHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 2
    ctx.beginPath()
    // Y-axis
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, padding + chartHeight)
    // X-axis
    ctx.lineTo(padding + chartWidth, padding + chartHeight)
    // Z-axis (depth)
    ctx.moveTo(padding, padding + chartHeight)
    ctx.lineTo(padding + Math.cos(rotationRad) * 30, padding + chartHeight + Math.sin(rotationRad) * 15)
    ctx.stroke()

    ctx.fillStyle = "#475569"
    ctx.font = "bold 14px system-ui"
    ctx.textAlign = "center"
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)"
    ctx.shadowBlur = 2
    ctx.fillText("Systolic", width * 0.25, height - 15)
    ctx.fillText("Diastolic", width * 0.75, height - 15)
    ctx.shadowBlur = 0
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="font-heading font-bold text-slate-800 text-xl">3D Trend Visualization</CardTitle>
              <CardDescription className="text-slate-600">Interactive blood pressure trends with depth</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnimating(!isAnimating)}
              className={isAnimating ? "bg-emerald-50 border-emerald-200" : ""}
            >
              <RotateCcw className={`w-4 h-4 ${isAnimating ? "animate-spin" : ""}`} />
            </Button>
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-80 rounded-xl border border-slate-200 shadow-inner cursor-grab active:cursor-grabbing"
            style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}
            onMouseDown={(e) => {
              const startX = e.clientX
              const startRotation = rotation

              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX
                setRotation(startRotation + deltaX * 0.5)
              }

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove)
                document.removeEventListener("mouseup", handleMouseUp)
              }

              document.addEventListener("mousemove", handleMouseMove)
              document.addEventListener("mouseup", handleMouseUp)
            }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <TrendingUp className="w-6 h-6 animate-pulse text-emerald-600" />
                <span className="font-medium">Loading 3D visualization...</span>
              </div>
            </div>
          )}
          {!loading && readings.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No data available for this period</p>
                <p className="text-sm">Add some blood pressure readings to see the 3D visualization</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-8 mt-6 p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded shadow-sm"></div>
            <span className="text-slate-700 font-medium">Systolic</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded shadow-sm"></div>
            <span className="text-slate-700 font-medium">Diastolic</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-amber-500 rounded-full shadow-sm animate-pulse"></div>
            <span className="text-slate-700 font-medium">Abnormal</span>
          </div>
          <div className="text-xs text-slate-500 ml-4">Drag to rotate • Click animate button for auto-rotation</div>
        </div>
      </CardContent>
    </Card>
  )
}
