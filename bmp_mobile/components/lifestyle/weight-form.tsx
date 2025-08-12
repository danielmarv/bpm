"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Scale } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"

interface WeightFormProps {
  onSuccess?: () => void
}

export function WeightForm({ onSuccess }: WeightFormProps) {
  const [formData, setFormData] = useState({
    weight: "",
    unit: "kg" as "kg" | "lbs",
    bodyFat: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = {
        weight: Number.parseFloat(formData.weight),
        unit: formData.unit,
        bodyFat: formData.bodyFat ? Number.parseFloat(formData.bodyFat) : undefined,
        notes: formData.notes || undefined,
      }

      await apiService.logWeight(data)

      toast({
        title: "Weight logged",
        description: `${data.weight} ${data.unit} recorded successfully`,
      })

      // Reset form
      setFormData({
        weight: "",
        unit: "kg",
        bodyFat: "",
        notes: "",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Failed to log weight",
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
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="font-heading font-bold text-[#475569]">Log Weight</CardTitle>
            <CardDescription className="text-[#475569]/70">Track your weight and body composition</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-[#475569] font-medium">
                Weight *
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70.5"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                required
                min="20"
                max="300"
                className="h-11 text-lg font-mono text-center"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-[#475569] font-medium">
                Unit *
              </Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyFat" className="text-[#475569] font-medium">
              Body Fat % (optional)
            </Label>
            <Input
              id="bodyFat"
              type="number"
              step="0.1"
              placeholder="15.2"
              value={formData.bodyFat}
              onChange={(e) => handleInputChange("bodyFat", e.target.value)}
              min="3"
              max="50"
              className="h-11 text-lg font-mono text-center"
            />
            <p className="text-xs text-[#475569]/60">If measured with a body composition scale</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[#475569] font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Time of day, before/after meal, etc..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-[#059669] hover:bg-[#047857] text-white font-medium"
            disabled={isLoading || !formData.weight}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging...
              </>
            ) : (
              <>
                <Scale className="mr-2 h-4 w-4" />
                Log Weight
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
