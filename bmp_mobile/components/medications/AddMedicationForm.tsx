"use client"

import { useState } from "react"
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from "react-native"
import { PrimaryButton, SecondaryButton } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { FrequencySelector } from "./FrequencySelector"
import { TimeSelector } from "./TimeSelector"
import { medicationsApi, Medication } from "../../services/medicationsApi"

interface AddMedicationFormProps {
  onMedicationAdded: () => void
}

export function AddMedicationForm({ onMedicationAdded }: AddMedicationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    dosageAmount: "",
    dosageUnit: "mg",
    frequency: "once_daily" as Medication["frequency"],
    times: ["08:00"],
    instructions: "",
    startDate: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!formData.name || !formData.dosageAmount) {
      Alert.alert("Error", "Please fill in medication name and dosage")
      return
    }

    try {
      setLoading(true)

      // Include required fields per Medication type
      const medicationData: Omit<Medication, "_id" | "userId" | "createdAt" | "updatedAt"> = {
        name: formData.name,
        dosage: {
          amount: Number.parseFloat(formData.dosageAmount),
          unit: formData.dosageUnit,
        },
        frequency: formData.frequency,
        startDate: formData.startDate,
        active: true,
        sideEffects: [],
        customSchedule: [],
        reminderSchedule: {
          enabled: true,
          times: formData.times,
          daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
      }

      await medicationsApi.createMedication(medicationData)

      Alert.alert("Success", "Medication added successfully", [
        { text: "OK", onPress: onMedicationAdded },
      ])
    } catch (error) {
      console.error("Error adding medication:", error)
      Alert.alert("Error", "Failed to add medication. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Medication Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => updateFormData("name", value)}
            placeholder="e.g., Lisinopril"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dosage *</Text>
          <View style={styles.dosageContainer}>
            <TextInput
              style={[styles.input, styles.dosageAmountInput]}
              value={formData.dosageAmount}
              onChangeText={(value) => updateFormData("dosageAmount", value)}
              placeholder="10"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.dosageUnitInput]}
              value={formData.dosageUnit}
              onChangeText={(value) => updateFormData("dosageUnit", value)}
              placeholder="mg"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Frequency</Text>
          <FrequencySelector
            value={formData.frequency}
            onValueChange={(frequency) => updateFormData("frequency", frequency)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reminder Times</Text>
          <TimeSelector
            frequency={formData.frequency}
            selectedTimes={formData.times}        // <-- matches TimeSelector
            onTimesChange={(times) => updateFormData("times", times)} // <-- matches TimeSelector
          />

        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Instructions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.instructions}
            onChangeText={(value) => updateFormData("instructions", value)}
            placeholder="e.g., Take with food"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
          {loading ? (
            <LoadingSpinner size="large" color="#7c3aed" />
          ) : (
            <>
              <PrimaryButton title="Add Medication" onPress={handleSubmit} style={styles.primaryButton} />
              <SecondaryButton title="Cancel" onPress={onMedicationAdded} style={styles.secondaryButton} />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { backgroundColor: "#ffffff", borderRadius: 16, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 16, fontFamily: "Montserrat-SemiBold", color: "#1e293b", marginBottom: 8 },
  input: { fontSize: 16, fontFamily: "OpenSans-Regular", color: "#1e293b", backgroundColor: "#f8fafc", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  dosageContainer: { flexDirection: "row", gap: 12 },
  dosageAmountInput: { flex: 2 },
  dosageUnitInput: { flex: 1 },
  textArea: { height: 80, paddingTop: 14 },
  buttonContainer: { gap: 12, marginTop: 8 },
  primaryButton: { backgroundColor: "#7c3aed" },
  secondaryButton: { borderColor: "#7c3aed" },
})
