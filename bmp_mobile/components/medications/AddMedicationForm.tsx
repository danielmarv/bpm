"use client"

import { useState } from "react"
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from "react-native"
import { PrimaryButton, SecondaryButton } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { FrequencySelector } from "./FrequencySelector"
import { TimeSelector } from "./TimeSelector"

interface AddMedicationFormProps {
  onMedicationAdded: () => void
}

export function AddMedicationForm({ onMedicationAdded }: AddMedicationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "once_daily",
    times: ["08:00"],
    instructions: "",
    startDate: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!formData.name || !formData.dosage) {
      Alert.alert("Error", "Please fill in medication name and dosage")
      return
    }

    try {
      setLoading(true)
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      Alert.alert("Success", "Medication added successfully", [
        {
          text: "OK",
          onPress: onMedicationAdded,
        },
      ])
    } catch (error) {
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
          <TextInput
            style={styles.input}
            value={formData.dosage}
            onChangeText={(value) => updateFormData("dosage", value)}
            placeholder="e.g., 10mg"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Frequency</Text>
          <FrequencySelector
            selectedFrequency={formData.frequency}
            onFrequencyChange={(frequency) => updateFormData("frequency", frequency)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reminder Times</Text>
          <TimeSelector
            frequency={formData.frequency}
            selectedTimes={formData.times}
            onTimesChange={(times) => updateFormData("times", times)}
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
  container: {
    flex: 1,
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textArea: {
    height: 80,
    paddingTop: 14,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: "#7c3aed",
  },
  secondaryButton: {
    borderColor: "#7c3aed",
  },
})
