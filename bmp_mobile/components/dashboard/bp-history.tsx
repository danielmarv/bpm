"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Filter, AlertTriangle, Clock } from "lucide-react"
import { apiService, type BloodPressureReading } from "@/lib/api"
import { format } from "date-fns"

export function BPHistory() {
  const [readings, setReadings] = useState<BloodPressureReading[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    abnormalOnly: false,
    page: 1,
    limit: 10,
  })

  useEffect(() => {
    loadReadings()
  }, [filters])

  const loadReadings = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBPReadings(filters)
      setReadings(response.data.readings)
    } catch (error) {
      console.error("Failed to load readings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) {
      return { label: "Normal", color: "bg-green-100 text-green-800", icon: null }
    }
    if (systolic < 130 && diastolic < 80) {
      return { label: "Elevated", color: "bg-yellow-100 text-yellow-800", icon: null }
    }
    if (systolic < 140 || diastolic < 90) {
      return { label: "Stage 1", color: "bg-orange-100 text-orange-800", icon: <AlertTriangle className="w-3 h-3" /> }
    }
    return { label: "Stage 2", color: "bg-red-100 text-red-800", icon: <AlertTriangle className="w-3 h-3" /> }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#059669] rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="font-heading font-bold text-[#475569]">Reading History</CardTitle>
              <CardDescription className="text-[#475569]/70">Track your blood pressure over time</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, abnormalOnly: !filters.abnormalOnly })}
            className={filters.abnormalOnly ? "bg-orange-50 border-orange-200" : ""}
          >
            <Filter className="w-4 h-4 mr-2" />
            {filters.abnormalOnly ? "Show All" : "Abnormal Only"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="date"
              placeholder="Start date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="h-10"
            />
          </div>
          <div className="flex-1">
            <Input
              type="date"
              placeholder="End date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        {/* Readings List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : readings.length === 0 ? (
            <div className="text-center py-8 text-[#475569]/70">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No readings found for the selected period</p>
            </div>
          ) : (
            readings.map((reading) => {
              const status = getBPStatus(reading.systolic, reading.diastolic)
              return (
                <div
                  key={reading._id}
                  className="flex items-center justify-between p-4 bg-[#f1f5f9] rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-mono font-bold text-[#475569]">
                        {reading.systolic}/{reading.diastolic}
                      </div>
                      <div className="text-xs text-[#475569]/70">mmHg</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-mono font-bold text-[#475569]">{reading.pulse}</div>
                      <div className="text-xs text-[#475569]/70">bpm</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={status.color}>
                          {status.icon}
                          {status.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-[#475569]/70">
                        {format(new Date(reading.timestamp), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      {reading.notes && <div className="text-sm text-[#475569]/60 mt-1 italic">{reading.notes}</div>}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Load More */}
        {readings.length >= filters.limit && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => handleFilterChange("limit", filters.limit + 10)}
              disabled={loading}
            >
              Load More Readings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
