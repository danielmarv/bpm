"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pill, Clock, MoreVertical, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService, type Medication } from "@/lib/api"
import { MedicationForm } from "./medication-form"

export function MedicationList() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadMedications()
  }, [])

  const loadMedications = async () => {
    try {
      setLoading(true)
      const response = await apiService.getMedications({ active: true })
      setMedications(response.data.medications)
    } catch (error) {
      console.error("Failed to load medications:", error)
      toast({
        title: "Failed to load medications",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTakeDose = async (medication: Medication) => {
    try {
      await apiService.logMedicationDose(medication._id, {
        dosageTaken: medication.dosage,
        notes: "Taken via quick action",
      })

      toast({
        title: "Dose recorded",
        description: `${medication.name} ${medication.dosage} logged successfully`,
      })
    } catch (error) {
      toast({
        title: "Failed to record dose",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (medication: Medication) => {
    try {
      await apiService.updateMedication(medication._id, {
        isActive: !medication.isActive,
      })

      toast({
        title: medication.isActive ? "Medication paused" : "Medication resumed",
        description: `${medication.name} has been ${medication.isActive ? "paused" : "resumed"}`,
      })

      loadMedications()
    } catch (error) {
      toast({
        title: "Failed to update medication",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (medication: Medication) => {
    if (!confirm(`Are you sure you want to delete ${medication.name}?`)) return

    try {
      await apiService.deleteMedication(medication._id)
      toast({
        title: "Medication deleted",
        description: `${medication.name} has been removed from your regimen`,
      })
      loadMedications()
    } catch (error) {
      toast({
        title: "Failed to delete medication",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      once_daily: "Once daily",
      twice_daily: "Twice daily",
      three_times_daily: "3x daily",
      four_times_daily: "4x daily",
      as_needed: "As needed",
    }
    return labels[frequency as keyof typeof labels] || frequency
  }

  const isOverdue = (medication: Medication) => {
    if (!medication.reminderSchedule.enabled || medication.frequency === "as_needed") return false

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    return medication.reminderSchedule.times.some((time) => time < currentTime)
  }

  if (showAddForm) {
    return (
      <MedicationForm
        onSuccess={() => {
          setShowAddForm(false)
          loadMedications()
        }}
        onCancel={() => setShowAddForm(false)}
      />
    )
  }

  if (editingMedication) {
    return (
      <MedicationForm
        medication={editingMedication}
        onSuccess={() => {
          setEditingMedication(null)
          loadMedications()
        }}
        onCancel={() => setEditingMedication(null)}
      />
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#059669] rounded-full flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="font-heading font-bold text-[#475569]">My Medications</CardTitle>
              <CardDescription className="text-[#475569]/70">
                Manage your medication regimen and track adherence
              </CardDescription>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-[#059669] hover:bg-[#047857] text-white">
            <Pill className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-8 text-[#475569]/70">
            <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No medications added yet</p>
            <Button variant="outline" className="mt-2 bg-transparent" onClick={() => setShowAddForm(true)}>
              Add your first medication
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((medication) => {
              const overdue = isOverdue(medication)

              return (
                <div
                  key={medication._id}
                  className={`p-4 rounded-lg border transition-colors ${
                    overdue ? "bg-orange-50 border-orange-200" : "bg-[#f1f5f9] border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          overdue ? "bg-orange-500" : "bg-[#10b981]"
                        }`}
                      >
                        <Pill className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading font-bold text-[#475569]">{medication.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {medication.dosage}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getFrequencyLabel(medication.frequency)}
                          </Badge>
                          {overdue && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-[#475569]/70">
                          {medication.reminderSchedule.enabled && medication.reminderSchedule.times.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{medication.reminderSchedule.times.join(", ")}</span>
                            </div>
                          )}
                          {medication.prescribedBy && <span>Prescribed by {medication.prescribedBy}</span>}
                        </div>

                        {medication.instructions && (
                          <p className="text-sm text-[#475569]/60 mt-1 italic">{medication.instructions}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleTakeDose(medication)}
                        className="bg-[#10b981] hover:bg-[#059669] text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Take Dose
                      </Button>

                      <Switch checked={medication.isActive} onCheckedChange={() => handleToggleActive(medication)} />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingMedication(medication)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(medication)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
