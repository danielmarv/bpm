"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Pill, RotateCcw, Calendar } from "lucide-react"
import { apiService, type Medication, type MedicationAdherence } from "@/lib/api"

export function Medication3DChart() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [adherenceData, setAdherenceData] = useState<MedicationAdherence[]>([])
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month")
  const [loading, setLoading] = useState(true)
  const [rotation, setRotation] = useState(45)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    loadData()
  }, [period])

  useEffect(() => {
    if (medications.length > 0 && canvasRef.current) {
      draw3DAdherenceChart()
    }
  }, [medications, adherenceData, rotation])

  const loadData = async () => {
    try {
      setLoading(true)
      const [medsResponse, adherenceResponse] = await Promise.all([
        apiService.getMedications({ active: true }),
        apiService.getMedicationAdherence(),
      ])
      setMedications(medsResponse.data.medications)
      setAdherenceData(adherenceResponse.data)
    } catch (error) {
      console.error("Failed to load medication data:", error)
    } finally {
      setLoading(false)
    }
  }

  const draw3DAdherenceChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    const padding = 60

    ctx.clearRect(0, 0, width, height)

    if (medications.length === 0) return

    // Enhanced gradient background
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 2,
    )
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.1)")
    gradient.addColorStop(0.7, "rgba(59, 130, 246, 0.05)")
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.02)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2
    const rotationRad = (rotation * Math.PI) / 180

    // Draw 3D cylindrical adherence bars
    const barWidth = chartWidth / medications.length
    const maxHeight = chartHeight * 0.7

    medications.forEach((medication, index) => {
      const adherence = adherenceData.find((a) => a.medicationId === medication._id)
      const adherenceRate = adherence?.adherenceRate || 0
      const barHeight = (adherenceRate / 100) * maxHeight

      const baseX = padding + index * barWidth + barWidth * 0.1
      const baseY = padding + chartHeight - barHeight
      const cylinderWidth = barWidth * 0.6
      const depth = 25

      // 3D cylinder effect
      const x3d = baseX + Math.cos(rotationRad) * depth
      const y3d = baseY + Math.sin(rotationRad) * depth * 0.3

      // Color based on adherence rate
      let color1, color2, color3
      if (adherenceRate >= 80) {
        color1 = "#10b981"
        color2 = "#059669"
        color3 = "#047857"
      } else if (adherenceRate >= 60) {
        color1 = "#f59e0b"
        color2 = "#d97706"
        color3 = "#b45309"
      } else {
        color1 = "#ef4444"
        color2 = "#dc2626"
        color3 = "#b91c1c"
      }

      // Draw cylinder top (ellipse)
      ctx.fillStyle = color1
      ctx.beginPath()
      ctx.ellipse(baseX + cylinderWidth / 2, baseY, cylinderWidth / 2, cylinderWidth / 6, 0, 0, 2 * Math.PI)
      ctx.fill()

      // Draw cylinder body
      const bodyGradient = ctx.createLinearGradient(baseX, baseY, baseX + cylinderWidth, baseY + barHeight)
      bodyGradient.addColorStop(0, color1)
      bodyGradient.addColorStop(0.5, color2)
      bodyGradient.addColorStop(1, color3)

      ctx.fillStyle = bodyGradient
      ctx.fillRect(baseX, baseY, cylinderWidth, barHeight)

      // Draw cylinder side (3D effect)
      ctx.fillStyle = color3
      ctx.beginPath()
      ctx.moveTo(baseX + cylinderWidth, baseY)
      ctx.lineTo(x3d + cylinderWidth, y3d)
      ctx.lineTo(x3d + cylinderWidth, y3d + barHeight)
      ctx.lineTo(baseX + cylinderWidth, baseY + barHeight)
      ctx.closePath()
      ctx.fill()

      // Draw cylinder bottom
      ctx.fillStyle = color2
      ctx.beginPath()
      ctx.ellipse(baseX + cylinderWidth / 2, baseY + barHeight, cylinderWidth / 2, cylinderWidth / 6, 0, 0, 2 * Math.PI)
      ctx.fill()

      // Add adherence percentage label
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 12px system-ui"
      ctx.textAlign = "center"
      ctx.fillText(`${Math.round(adherenceRate)}%`, baseX + cylinderWidth / 2, baseY - 10)

      // Add medication name
      ctx.fillStyle = "#6b7280"
      ctx.font = "10px system-ui"
      ctx.save()
      ctx.translate(baseX + cylinderWidth / 2, padding + chartHeight + 20)
      ctx.rotate(-Math.PI / 6)
      ctx.fillText(medication.name.substring(0, 10), 0, 0)
      ctx.restore()
    })

    // Draw 3D grid
    ctx.strokeStyle = "rgba(107, 114, 128, 0.2)"
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="font-heading font-bold text-slate-800 text-xl">3D Medication Adherence</CardTitle>
              <CardDescription className="text-slate-600">Visual adherence tracking with depth</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setRotation((prev) => (prev + 15) % 360)}>
              <RotateCcw className="w-4 h-4" />
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
            className="w-full h-72 rounded-xl border border-slate-200 shadow-inner cursor-pointer"
            style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)" }}
            onClick={() => setRotation((prev) => (prev + 30) % 360)}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-6 h-6 animate-pulse text-blue-600" />
                <span className="font-medium">Loading adherence data...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-slate-700">≥80% Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span className="text-sm text-slate-700">60-79% Fair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-slate-700">&lt;60% Poor</span>
          </div>
          <div className="text-xs text-slate-500 ml-4">Click to rotate view</div>
        </div>
      </CardContent>
    </Card>
  )
}
