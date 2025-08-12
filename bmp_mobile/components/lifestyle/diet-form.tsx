"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Utensils, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"

interface FoodItem {
  name: string
  quantity: string
  calories: number
  sodium: number
}

interface DietFormProps {
  onSuccess?: () => void
}

export function DietForm({ onSuccess }: DietFormProps) {
  const [formData, setFormData] = useState({
    meal: "" as "breakfast" | "lunch" | "dinner" | "snack" | "",
    foods: [{ name: "", quantity: "", calories: 0, sodium: 0 }] as FoodItem[],
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const validFoods = formData.foods.filter((food) => food.name && food.quantity && food.calories > 0)

      if (validFoods.length === 0) {
        throw new Error("Please add at least one food item")
      }

      const data = {
        meal: formData.meal as "breakfast" | "lunch" | "dinner" | "snack",
        foods: validFoods,
        notes: formData.notes || undefined,
      }

      await apiService.logDiet(data)

      const totalCalories = validFoods.reduce((sum, food) => sum + food.calories, 0)

      toast({
        title: "Meal logged",
        description: `${data.meal} with ${totalCalories} calories recorded`,
      })

      // Reset form
      setFormData({
        meal: "",
        foods: [{ name: "", quantity: "", calories: 0, sodium: 0 }],
        notes: "",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Failed to log meal",
        description: error instanceof Error ? error.message : "Please check your input and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addFoodItem = () => {
    setFormData((prev) => ({
      ...prev,
      foods: [...prev.foods, { name: "", quantity: "", calories: 0, sodium: 0 }],
    }))
  }

  const removeFoodItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      foods: prev.foods.filter((_, i) => i !== index),
    }))
  }

  const updateFoodItem = (index: number, field: keyof FoodItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      foods: prev.foods.map((food, i) =>
        i === index ? { ...food, [field]: field === "name" || field === "quantity" ? value : Number(value) } : food,
      ),
    }))
  }

  const getTotalCalories = () => {
    return formData.foods.reduce((sum, food) => sum + (food.calories || 0), 0)
  }

  const getTotalSodium = () => {
    return formData.foods.reduce((sum, food) => sum + (food.sodium || 0), 0)
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="font-heading font-bold text-[#475569]">Log Meal</CardTitle>
            <CardDescription className="text-[#475569]/70">Track your nutrition and dietary intake</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="meal" className="text-[#475569] font-medium">
              Meal Type *
            </Label>
            <Select value={formData.meal} onValueChange={(value) => setFormData({ ...formData, meal: value as any })}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[#475569] font-medium">Food Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addFoodItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Food
              </Button>
            </div>

            <div className="space-y-3">
              {formData.foods.map((food, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Input
                      placeholder="Food name"
                      value={food.name}
                      onChange={(e) => updateFoodItem(index, "name", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Quantity"
                      value={food.quantity}
                      onChange={(e) => updateFoodItem(index, "quantity", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Calories"
                      value={food.calories || ""}
                      onChange={(e) => updateFoodItem(index, "calories", e.target.value)}
                      min="0"
                      className="h-10"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Sodium (mg)"
                      value={food.sodium || ""}
                      onChange={(e) => updateFoodItem(index, "sodium", e.target.value)}
                      min="0"
                      className="h-10"
                    />
                  </div>
                  <div className="col-span-2">
                    {formData.foods.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeFoodItem(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-[#f1f5f9] rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#475569]/70">Total Calories:</span>
                <span className="font-mono font-bold text-[#475569]">{getTotalCalories()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#475569]/70">Total Sodium:</span>
                <span className="font-mono font-bold text-[#475569]">{getTotalSodium()}mg</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[#475569] font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="How did you feel after eating? Any observations..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[80px] resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-[#10b981] hover:bg-[#059669] text-white font-medium"
            disabled={isLoading || !formData.meal || formData.foods.every((f) => !f.name)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging...
              </>
            ) : (
              <>
                <Utensils className="mr-2 h-4 w-4" />
                Log Meal
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
