"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"
import { apiService, type BloodPressureStats } from "@/lib/api"

export function BPStatsCard() {
  const [stats, setStats] = useState<BloodPressureStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await apiService.getBPStats("month")
      setStats(response.data)
    } catch (error) {
      console.error("Failed to load stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { label: "Normal", color: "bg-green-100 text-green-800" }
    if (systolic < 130 && diastolic < 80) return { label: "Elevated", color: "bg-yellow-100 text-yellow-800" }
    if (systolic < 140 || diastolic < 90) return { label: "Stage 1", color: "bg-orange-100 text-orange-800" }
    return { label: "Stage 2", color: "bg-red-100 text-red-800" }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingDown className="w-4 h-4 text-green-600" />
      case "worsening":
        return <TrendingUp className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
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

  if (!stats) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center text-[#475569]/70">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No data available</p>
        </CardContent>
      </Card>
    )
  }

  const category = getBPCategory(stats.averages.systolic, stats.averages.diastolic)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="font-heading font-bold text-[#475569]">Monthly Overview</CardTitle>
            <CardDescription className="text-[#475569]/70">Your blood pressure statistics</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average BP */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-mono font-bold text-[#475569]">
            {Math.round(stats.averages.systolic)}/{Math.round(stats.averages.diastolic)}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge className={category.color}>{category.label}</Badge>
            <span className="text-sm text-[#475569]/70">Average BP</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-1">
            <div className="text-lg font-mono font-semibold text-[#475569]">{Math.round(stats.averages.pulse)}</div>
            <div className="text-xs text-[#475569]/70">Avg Pulse (bpm)</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg font-mono font-semibold text-[#475569]">{stats.totalReadings}</div>
            <div className="text-xs text-[#475569]/70">Total Readings</div>
          </div>
        </div>

        {/* Trends */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#475569]/70">Systolic Trend</span>
            <div className="flex items-center gap-1">
              {getTrendIcon(stats.trends.systolic)}
              <span className="text-sm capitalize text-[#475569]">{stats.trends.systolic}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#475569]/70">Diastolic Trend</span>
            <div className="flex items-center gap-1">
              {getTrendIcon(stats.trends.diastolic)}
              <span className="text-sm capitalize text-[#475569]">{stats.trends.diastolic}</span>
            </div>
          </div>
        </div>

        {/* Abnormal Readings Alert */}
        {stats.abnormalReadings > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-sm text-orange-800">
              <strong>{stats.abnormalReadings}</strong> of {stats.totalReadings} readings were elevated this month.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
