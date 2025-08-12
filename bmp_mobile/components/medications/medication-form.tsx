"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Loader2, Pill, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService, type Medication } from "@/lib/api"

interface MedicationFormProps {
  medication?: Medication
  onSuccess?: () => void
  onCancel?: () => void
}

export function MedicationForm({ medication, onSuccess, onCancel }: MedicationFormProps) {
  const [formData, setFormData] = useState({
    name: medication?.name || "",
    dosage: medication?.dosage || "",
    frequency: medication?.frequency || "",
    startDate: medication?.startDate ? medication.startDate.split("T")[0] : "",
    endDate: medication?.endDate ? medication.endDate.split("T")[0] : "",
    instructions: medication?.instructions || "",
    prescribedBy: medication?.prescribedBy || "",
    reminderEnabled: medication?.reminderSchedule.enabled ?? true,
    reminderTimes: medication?.reminderSchedule.times || ["08:00"],
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const frequencyOptions = [
    { value: "once_daily", label: "Once daily", times: 1 },
    { value: "twice_daily", label: "Twice daily", times: 2 },
    { value: "three_times_daily", label: "Three times daily", times: 3 },
    { value: "four_times_daily", label: "Four times daily", times: 4 },
    { value: "as_needed", label: "As needed", times: 0 },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = {
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency as any,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        instructions: formData.instructions || undefined,
        prescribedBy: formData.prescribedBy || undefined,
        reminderSchedule: {
          times: formData.reminderTimes,
          enabled: formData.reminderEnabled,
        },
      }

      if (medication) {
        await apiService.updateMedication(medication._id, data)
        toast({
          title: "Medication updated",
          description: `${data.name} has been updated successfully`,
        })
      } else {
        await apiService.createMedication(data)
        toast({
          title: "Medication added",
          description: `${data.name} has been added to your regimen`,
        })
      }

      onSuccess?.()
    } catch (error) {
      toast({
        title: medication ? "Failed to update medication" : "Failed to add medication",
        description: "Please check your input and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFrequencyChange = (frequency: string) => {
    const option = frequencyOptions.find((opt) => opt.value === frequency)
    if (option && option.times > 0) {
      const defaultTimes = Array.from({ length: option.times }, (_, i) => {
        const hour = 8 + (i * 12) / option.times
        return `${Math.floor(hour).toString().padStart(2, "0")}:00`
      })
      setFormData((prev) => ({
        ...prev,
        frequency,
        reminderTimes: defaultTimes,
      }))
    } else {
      setFormData((prev) => ({ ...prev, frequency, reminderTimes: [] }))
    }
  }

  const addReminderTime = () => {
    setFormData((prev) => ({
      ...prev,
      reminderTimes: [...prev.reminderTimes, "12:00"],
    }))
  }

  const removeReminderTime = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      reminderTimes: prev.reminderTimes.filter((_, i) => i !== index),
    }))
  }

  const updateReminderTime = (index: number, time: string) => {
    setFormData((prev) => ({
      ...prev,
      reminderTimes: prev.reminderTimes.map((t, i) => (i === index ? time : t)),
    }))
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#059669] rounded-full flex items-center justify-center">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="font-heading font-bold text-[#475569]">
              {medication ? "Edit Medication" : "Add New Medication"}
            </CardTitle>
            <CardDescription className="text-[#475569]/70">
              {medication ? "Update medication details" : "Add a medication to your regimen"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#475569] font-medium">
                Medication Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Lisinopril"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage" className="text-[#475569] font-medium">
                Dosage *
              </Label>
              <Input
                id="dosage"
                placeholder="e.g., 10mg"
                value={formData.dosage}
                onChange={(e) => handleInputChange("dosage", e.target.value)}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-[#475569] font-medium">
              Frequency *
            </Label>
            <Select value={formData.frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-[#475569] font-medium">
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-[#475569] font-medium">
                End Date (optional)
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescribedBy" className="text-[#475569] font-medium">
              Prescribed By (optional)
            </Label>
            <Input
              id="prescribedBy"
              placeholder="e.g., Dr. Smith"
              value={formData.prescribedBy}
              onChange={(e) => handleInputChange("prescribedBy", e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-[#475569] font-medium">
              Instructions (optional)
            </Label>
            <Textarea
              id="instructions"
              placeholder="e.g., Take with food, avoid alcohol..."
              value={formData.instructions}
              onChange={(e) => handleInputChange("instructions", e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Reminder Settings */}
          <div className="space-y-4 p-4 bg-[#f1f5f9] rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[#475569] font-medium">Medication Reminders</Label>
                <p className="text-sm text-[#475569]/70">Get notified when it's time to take your medication</p>
              </div>
              <Switch
                checked={formData.reminderEnabled}
                onCheckedChange={(checked) => handleInputChange("reminderEnabled", checked)}
              />
            </div>

            {formData.reminderEnabled && formData.frequency !== "as_needed" && (
              <div className="space-y-3">
                <Label className="text-[#475569] font-medium">Reminder Times</Label>
                <div className="space-y-2">
                  {formData.reminderTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateReminderTime(index, e.target.value)}
                        className="h-10"
                      />
                      {formData.reminderTimes.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeReminderTime(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addReminderTime}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Time
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 h-11 bg-[#059669] hover:bg-[#047857] text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {medication ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <Pill className="mr-2 h-4 w-4" />
                  {medication ? "Update Medication" : "Add Medication"}
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="h-11 bg-transparent">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
