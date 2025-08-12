"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Calendar } from "lucide-react"
import { apiService, type Medication, type MedicationAdherence } from "@/lib/api"

export function AdherenceChart() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [selectedMedication, setSelectedMedication] = useState<string>("")
  const [adherence, setAdherence] = useState<MedicationAdherence | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMedications()
  }, [])

  useEffect(() => {
    if (selectedMedication) {
      loadAdherence(selectedMedication)
    }
  }, [selectedMedication])

  const loadMedications = async () => {
    try {
      const response = await apiService.getMedications({ active: true })
      const meds = response.data.medications
      setMedications(meds)

      if (meds.length > 0 && !selectedMedication) {
        setSelectedMedication(meds[0]._id)
      }
    } catch (error) {
      console.error("Failed to load medications:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAdherence = async (medicationId: string) => {
    try {
      const response = await apiService.getMedicationAdherence(medicationId)
      setAdherence(response.data)
    } catch (error) {
      console.error("Failed to load adherence:", error)
      setAdherence(null)
    }
  }

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600"
    if (rate >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getAdherenceLabel = (rate: number) => {
    if (rate >= 90) return "Excellent"
    if (rate >= 75) return "Good"
    if (rate >= 50) return "Fair"
    return "Poor"
  }

  const selectedMed = medications.find((m) => m._id === selectedMedication)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="font-heading font-bold text-[#475569]">Medication Adherence</CardTitle>
              <CardDescription className="text-[#475569]/70">
                Track how well you're following your medication schedule
              </CardDescription>
            </div>
          </div>

          {medications.length > 0 && (
            <Select value={selectedMedication} onValueChange={setSelectedMedication}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                {medications.map((med) => (
                  <SelectItem key={med._id} value={med._id}>
                    {med.name} {med.dosage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ) : !selectedMed ? (
          <div className="text-center py-8 text-[#475569]/70">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No medications to track</p>
          </div>
        ) : !adherence ? (
          <div className="text-center py-8 text-[#475569]/70">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No adherence data available yet</p>
            <p className="text-sm mt-1">Start logging doses to see your progress</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Adherence Rate */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className={`text-4xl font-mono font-bold ${getAdherenceColor(adherence.adherenceRate)}`}>
                  {Math.round(adherence.adherenceRate)}%
                </div>
                <Badge
                  className={`${
                    adherence.adherenceRate >= 90
                      ? "bg-green-100 text-green-800"
                      : adherence.adherenceRate >= 75
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {getAdherenceLabel(adherence.adherenceRate)}
                </Badge>
              </div>

              <div className="space-y-2">
                <Progress value={adherence.adherenceRate} className="h-3" />
                <p className="text-sm text-[#475569]/70">
                  Adherence rate for {selectedMed.name} over the {adherence.period}
                </p>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-1">
                <div className="text-2xl font-mono font-bold text-[#059669]">{adherence.takenDoses}</div>
                <div className="text-xs text-[#475569]/70">Doses Taken</div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-2xl font-mono font-bold text-[#475569]">{adherence.totalDoses}</div>
                <div className="text-xs text-[#475569]/70">Total Doses</div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-2xl font-mono font-bold text-orange-600">{adherence.missedDoses}</div>
                <div className="text-xs text-[#475569]/70">Missed Doses</div>
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-3">
              {adherence.adherenceRate >= 90 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Excellent adherence!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    You're doing great at taking your medication consistently.
                  </p>
                </div>
              )}

              {adherence.adherenceRate < 75 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-800">
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-medium">Room for improvement</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Try setting more reminders or adjusting your schedule to improve adherence.
                  </p>
                </div>
              )}

              {adherence.missedDoses > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-800">
                    <strong>Tip:</strong> You've missed {adherence.missedDoses} doses recently. Consider enabling
                    reminders or linking doses to daily routines.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
