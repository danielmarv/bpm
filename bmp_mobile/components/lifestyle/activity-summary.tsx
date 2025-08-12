"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Activity, Utensils, Scale, Brain } from "lucide-react"
import { apiService, type ActivitySummary } from "@/lib/api"

export function ActivitySummaryCard() {
  const [summary, setSummary] = useState<ActivitySummary | null>(null)
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [period])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const response = await apiService.getActivitySummary(period)
      setSummary(response.data)
    } catch (error) {
      console.error("Failed to load activity summary:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "worsening":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-600"
      case "worsening":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getWeightTrendColor = (trend: string) => {
    switch (trend) {
      case "losing":
        return "text-blue-600"
      case "gaining":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center text-[#475569]/70">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No activity data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="font-heading font-bold text-[#475569]">Activity Summary</CardTitle>
              <CardDescription className="text-[#475569]/70">Your lifestyle tracking overview</CardDescription>
            </div>
          </div>
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
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exercise Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#059669]" />
            <h3 className="font-heading font-bold text-[#475569]">Exercise</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-mono font-bold text-[#475569]">{summary.exercise.totalSessions}</div>
              <div className="text-xs text-[#475569]/70">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono font-bold text-[#475569]">{summary.exercise.totalDuration}min</div>
              <div className="text-xs text-[#475569]/70">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono font-bold text-[#475569]">{summary.exercise.totalCalories}</div>
              <div className="text-xs text-[#475569]/70">Calories</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Badge className="bg-blue-100 text-blue-800 capitalize">
              {summary.exercise.averageIntensity} Intensity
            </Badge>
          </div>
        </div>

        {/* Diet Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#10b981]" />
            <h3 className="font-heading font-bold text-[#475569]">Nutrition</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-mono font-bold text-[#475569]">{summary.diet.totalEntries}</div>
              <div className="text-xs text-[#475569]/70">Meals Logged</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono font-bold text-[#475569]">
                {Math.round(summary.diet.averageCalories)}
              </div>
              <div className="text-xs text-[#475569]/70">Avg Calories</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono font-bold text-[#475569]">
                {Math.round(summary.diet.averageSodium)}mg
              </div>
              <div className="text-xs text-[#475569]/70">Avg Sodium</div>
            </div>
          </div>
        </div>

        {/* Weight Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#059669]" />
            <h3 className="font-heading font-bold text-[#475569]">Weight</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-mono font-bold text-[#475569]">{summary.weight.currentWeight}kg</div>
              <div className="text-xs text-[#475569]/70">Current</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-mono font-bold ${getWeightTrendColor(summary.weight.trend)}`}>
                {summary.weight.weightChange > 0 ? "+" : ""}
                {summary.weight.weightChange}kg
              </div>
              <div className="text-xs text-[#475569]/70">Change</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Badge className={`capitalize ${getWeightTrendColor(summary.weight.trend)}`}>{summary.weight.trend}</Badge>
          </div>
        </div>

        {/* Stress Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#10b981]" />
            <h3 className="font-heading font-bold text-[#475569]">Stress Level</h3>
          </div>
          <div className="text-center space-y-2">
            <div className={`text-2xl font-mono font-bold ${getTrendColor(summary.stress.trend)}`}>
              {summary.stress.averageLevel}/10
            </div>
            <Progress value={summary.stress.averageLevel * 10} className="h-2" />
            <div className="flex items-center justify-center gap-2">
              {getTrendIcon(summary.stress.trend)}
              <span className={`text-sm capitalize ${getTrendColor(summary.stress.trend)}`}>
                {summary.stress.trend}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
