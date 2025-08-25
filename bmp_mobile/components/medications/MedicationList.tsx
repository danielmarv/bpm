"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native"
import { MedicationCard } from "./MedicationCard"
import { PrimaryButton } from "../ui/Button"
import { Plus } from "../ui/Icons"
import { medicationsApi, type Medication } from "../../services/medicationsApi"

interface MedicationListProps {
  onAddMedication: () => void
}

export function MedicationList({ onAddMedication }: MedicationListProps) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMedications()
  }, [])

  const loadMedications = async () => {
    try {
      setLoading(true)
      const data = await medicationsApi.getMedications()
      setMedications(data)
    } catch (error) {
      console.error("Error loading medications:", error)
      Alert.alert("Error", "Failed to load medications. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogDose = async (medicationId: string, medication: Medication) => {
    try {
      // 1. Fetch adherence logs
      const logsResponse = await medicationsApi.getAdherenceLogs(medicationId)
      const logs = logsResponse.adherence ?? logsResponse.logs ?? []

      // 2. Get the last logged dose
      const lastLog = logs.sort(
        (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
      )[0]

      if (lastLog) {
        const now = new Date()
        const lastTaken = new Date(lastLog.takenAt)

        let intervalExceeded = false

        switch (medication.frequency) {
          case "once_daily":
            intervalExceeded = now.toDateString() === lastTaken.toDateString()
            break
          case "twice_daily":
            intervalExceeded = now.getTime() - lastTaken.getTime() < 12 * 60 * 60 * 1000
            break
          case "three_times_daily":
            intervalExceeded = now.getTime() - lastTaken.getTime() < 8 * 60 * 60 * 1000
            break
          case "four_times_daily":
            intervalExceeded = now.getTime() - lastTaken.getTime() < 6 * 60 * 60 * 1000
            break
          case "as_needed":
          case "custom":
            intervalExceeded = false
            break
        }

        if (intervalExceeded) {
          return Alert.alert(
            "Dose Already Logged",
            "You have already logged a dose for this interval. Please wait until the next scheduled dose."
          )
        }
      }

      // 3. Log the dose
      await medicationsApi.markAsTaken(medicationId)
      Alert.alert("Dose Logged", "Your medication dose has been recorded successfully.")
      loadMedications() // refresh list
    } catch (error) {
      console.error("Error logging dose:", error)
      Alert.alert("Error", "Failed to log dose. Please try again.")
    }
  }

  const handleEditMedication = (medicationId: string) => {
    Alert.alert("Edit Medication", "Edit functionality would open here.")
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading medications...</Text>
      </View>
    )
  }

  if (medications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Plus size={48} color="#94a3b8" />
        </View>
        <Text style={styles.emptyTitle}>No Medications Yet</Text>
        <Text style={styles.emptyDescription}>
          Add your first medication to start tracking your regimen
        </Text>
        <PrimaryButton title="Add Medication" onPress={onAddMedication} style={styles.emptyButton} />
      </View>
    )
  }

  const activeMedications = medications.filter((med) => med.active)
  const inactiveMedications = medications.filter((med) => !med.active)

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Active Medications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Medications ({activeMedications.length})</Text>
          <TouchableOpacity onPress={onAddMedication} style={styles.addButton}>
            <Plus size={20} color="#7c3aed" />
          </TouchableOpacity>
        </View>

        {activeMedications.map((medication) => (
          <MedicationCard
            key={medication._id}
            medication={medication}
            onLogDose={() => handleLogDose(medication._id!, medication)}
            onEdit={() => handleEditMedication(medication._id!)}
          />
        ))}
      </View>

      {/* Inactive Medications */}
      {inactiveMedications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inactive Medications ({inactiveMedications.length})</Text>
          {inactiveMedications.map((medication) => (
            <MedicationCard
              key={medication._id}
              medication={medication}
              onLogDose={() => handleLogDose(medication._id!, medication)}
              onEdit={() => handleEditMedication(medication._id!)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    minWidth: 200,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3e8ff",
    justifyContent: "center",
    alignItems: "center",
  },
})
