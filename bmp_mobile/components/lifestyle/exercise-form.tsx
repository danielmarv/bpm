"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Activity, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"

interface ExerciseFormProps {
  onSuccess?: () => void
}

export function ExerciseForm({ onSuccess }: ExerciseFormProps) {
  const [formData, setFormData] = useState({
    activity: "",
    duration: "",
    intensity: "" as "low" | "moderate" | "high" | "",
    caloriesBurned: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const commonActivities = [
    "Walking",
    "Running",
    "Cycling",
    "Swimming",
    "Yoga",
    "Weight Training",
    "Dancing",
    "Tennis",
    "Basketball",
    "Soccer",
    "Hiking",
    "Pilates",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = {
        activity: formData.activity,
        duration: Number.parseInt(formData.duration),
        intensity: formData.intensity as "low" | "moderate" | "high",
        caloriesBurned: Number.parseInt(formData.caloriesBurned),
        notes: formData.notes || undefined,
      }

      await apiService.logExercise(data)

      toast({
        title: "Exercise logged",
        description: `${data.activity} for ${data.duration} minutes recorded`,
      })

      // Reset form
      setFormData({
        activity: "",
        duration: "",
        intensity: "",
        caloriesBurned: "",
        notes: "",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Failed to log exercise",
        description: "Please check your input and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Auto-calculate calories based on activity and duration
    if (field === "duration" || field === "intensity" || field === "activity") {
      const duration = field === "duration" ? Number.parseInt(value) : Number.parseInt(formData.duration)
      const intensity = field === "intensity" ? value : formData.intensity

      if (duration && intensity) {
        const baseCalories = {
          low: 3,
          moderate: 5,
          high: 8,
        }
        const estimated = duration * (baseCalories[intensity as keyof typeof baseCalories] || 5)
        setFormData((prev) => ({ ...prev, caloriesBurned: estimated.toString() }))
      }
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#059669] rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="font-heading font-bold text-[#475569]">Log Exercise</CardTitle>
            <CardDescription className="text-[#475569]/70">Track your physical activity and fitness</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="activity" className="text-[#475569] font-medium">
              Activity *
            </Label>
            <Select value={formData.activity} onValueChange={(value) => handleInputChange("activity", value)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select or type activity" />
              </SelectTrigger>
              <SelectContent>
                {commonActivities.map((activity) => (
                  <SelectItem key={activity} value={activity}>
                    {activity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Or type custom activity"
              value={formData.activity}
              onChange={(e) => handleInputChange("activity", e.target.value)}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-[#475569] font-medium">
                Duration (minutes) *
              </Label>
              <Input
                id="duration"
                type="number"
                placeholder="30"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                required
                min="1"
                max="480"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intensity" className="text-[#475569] font-medium">
                Intensity *
              </Label>
              <Select value={formData.intensity} onValueChange={(value) => handleInputChange("intensity", value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Light effort</SelectItem>
                  <SelectItem value="moderate">Moderate - Some effort</SelectItem>
                  <SelectItem value="high">High - Vigorous effort</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caloriesBurned" className="text-[#475569] font-medium">
              Calories Burned (estimated)
            </Label>
            <Input
              id="caloriesBurned"
              type="number"
              placeholder="Auto-calculated"
              value={formData.caloriesBurned}
              onChange={(e) => handleInputChange("caloriesBurned", e.target.value)}
              min="1"
              className="h-11"
            />
            <p className="text-xs text-[#475569]/60">Automatically estimated based on duration and intensity</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[#475569] font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="How did you feel? Any observations..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-[#059669] hover:bg-[#047857] text-white font-medium"
            disabled={isLoading || !formData.activity || !formData.duration || !formData.intensity}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Log Exercise
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
