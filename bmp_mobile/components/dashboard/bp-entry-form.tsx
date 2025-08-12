"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Heart, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"

interface BPEntryFormProps {
  onSuccess?: () => void
}

export function BPEntryForm({ onSuccess }: BPEntryFormProps) {
  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = {
        systolic: Number.parseInt(formData.systolic),
        diastolic: Number.parseInt(formData.diastolic),
        pulse: Number.parseInt(formData.pulse),
        notes: formData.notes || undefined,
      }

      await apiService.createBPReading(data)

      toast({
        title: "Reading recorded",
        description: `BP: ${data.systolic}/${data.diastolic} mmHg, Pulse: ${data.pulse} bpm`,
      })

      // Reset form
      setFormData({
        systolic: "",
        diastolic: "",
        pulse: "",
        notes: "",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Failed to record reading",
        description: "Please check your input and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#059669] rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="font-heading font-bold text-[#475569]">Record New Reading</CardTitle>
            <CardDescription className="text-[#475569]/70">Enter your current blood pressure and pulse</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systolic" className="text-[#475569] font-medium">
                Systolic
              </Label>
              <div className="relative">
                <Input
                  id="systolic"
                  type="number"
                  placeholder="120"
                  value={formData.systolic}
                  onChange={(e) => handleInputChange("systolic", e.target.value)}
                  required
                  min="70"
                  max="250"
                  className="h-12 text-lg font-mono text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#475569]/50">mmHg</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diastolic" className="text-[#475569] font-medium">
                Diastolic
              </Label>
              <div className="relative">
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="80"
                  value={formData.diastolic}
                  onChange={(e) => handleInputChange("diastolic", e.target.value)}
                  required
                  min="40"
                  max="150"
                  className="h-12 text-lg font-mono text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#475569]/50">mmHg</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pulse" className="text-[#475569] font-medium">
                Pulse
              </Label>
              <div className="relative">
                <Input
                  id="pulse"
                  type="number"
                  placeholder="72"
                  value={formData.pulse}
                  onChange={(e) => handleInputChange("pulse", e.target.value)}
                  required
                  min="40"
                  max="200"
                  className="h-12 text-lg font-mono text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#475569]/50">bpm</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[#475569] font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g., After morning exercise, feeling relaxed..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#059669] hover:bg-[#047857] text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Record Reading
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
