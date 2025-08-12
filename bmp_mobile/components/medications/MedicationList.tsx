"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { MedicationCard } from "./MedicationCard"
import { PrimaryButton } from "../ui/Button"
import { Plus } from "../ui/Icons"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  nextDose: string
  adherenceRate: number
  isActive: boolean
}

interface MedicationListProps {
  onAddMedication: () => void
}

export function MedicationList({ onAddMedication }: MedicationListProps) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setMedications([
        {
          id: "1",
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          nextDose: "8:00 AM",
          adherenceRate: 92,
          isActive: true,
        },
        {
          id: "2",
          name: "Metoprolol",
          dosage: "25mg",
          frequency: "Twice daily",
          nextDose: "2:00 PM",
          adherenceRate: 88,
          isActive: true,
        },
        {
          id: "3",
          name: "Amlodipine",
          dosage: "5mg",
          frequency: "Once daily",
          nextDose: "8:00 AM",
          adherenceRate: 95,
          isActive: false,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleLogDose = (medicationId: string) => {
    Alert.alert("Dose Logged", "Your medication dose has been recorded successfully.")
    // Update medication state or refresh from API
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
        <Text style={styles.emptyDescription}>Add your first medication to start tracking your regimen</Text>
        <PrimaryButton title="Add Medication" onPress={onAddMedication} style={styles.emptyButton} />
      </View>
    )
  }

  const activeMedications = medications.filter((med) => med.isActive)
  const inactiveMedications = medications.filter((med) => !med.isActive)

  return (
    <View style={styles.container}>
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
            key={medication.id}
            medication={medication}
            onLogDose={() => handleLogDose(medication.id)}
            onEdit={() => handleEditMedication(medication.id)}
          />
        ))}
      </View>

      {/* Inactive Medications */}
      {inactiveMedications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inactive Medications ({inactiveMedications.length})</Text>
          {inactiveMedications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              onLogDose={() => handleLogDose(medication.id)}
              onEdit={() => handleEditMedication(medication.id)}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
