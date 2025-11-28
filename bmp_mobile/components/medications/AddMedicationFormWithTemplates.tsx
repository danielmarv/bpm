"use client"

import { useState } from "react"
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity } from "react-native"
import { PrimaryButton, SecondaryButton } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { FrequencySelector } from "./FrequencySelector"
import { TimeSelector } from "./TimeSelector"
import { TemplateBrowser } from "./TemplateBrowser"
import { CreateFromTemplate } from "./CreateFromTemplate"
import { Search, Plus, Edit3 } from "../ui/Icons"
import { medicationsApi, Medication } from "../../services/medicationsApi"
import { MedicationTemplate } from "../../services/medicationTemplatesApi"

interface AddMedicationFormProps {
  onMedicationAdded: () => void
}

type ViewMode = "choice" | "manual" | "browse_templates" | "create_from_template"

export function AddMedicationForm({ onMedicationAdded }: AddMedicationFormProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("choice")
  const [selectedTemplate, setSelectedTemplate] = useState<MedicationTemplate | null>(null)
  
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

  const handleSelectTemplate = (template: MedicationTemplate) => {
    setSelectedTemplate(template)
    setViewMode("create_from_template")
  }

  // Choice Screen - Select how to add medication
  if (viewMode === "choice") {
    return (
      <View style={styles.choiceContainer}>
        <Text style={styles.choiceTitle}>How would you like to add a medication?</Text>
        <Text style={styles.choiceSubtitle}>Choose from templates or create manually</Text>

        <View style={styles.choiceOptions}>
          <TouchableOpacity
            style={styles.choiceOption}
            onPress={() => setViewMode("browse_templates")}
          >
            <View style={styles.choiceIconContainer}>
              <Search size={32} color="#7c3aed" />
            </View>
            <Text style={styles.choiceOptionTitle}>Browse Templates</Text>
            <Text style={styles.choiceOptionDescription}>
              Select from pre-made medication templates created by healthcare providers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.choiceOption}
            onPress={() => setViewMode("manual")}
          >
            <View style={styles.choiceIconContainer}>
              <Edit3 size={32} color="#7c3aed" />
            </View>
            <Text style={styles.choiceOptionTitle}>Add Manually</Text>
            <Text style={styles.choiceOptionDescription}>
              Create a medication entry from scratch with custom details
            </Text>
          </TouchableOpacity>
        </View>

        <SecondaryButton 
          title="Cancel" 
          onPress={onMedicationAdded} 
          style={styles.cancelButton}
        />
      </View>
    )
  }

  // Template Browser
  if (viewMode === "browse_templates") {
    return (
      <TemplateBrowser
        onSelectTemplate={handleSelectTemplate}
        onBack={() => setViewMode("choice")}
        userRole="patient"
      />
    )
  }

  // Create from Template
  if (viewMode === "create_from_template" && selectedTemplate) {
    return (
      <CreateFromTemplate
        template={selectedTemplate}
        onMedicationCreated={onMedicationAdded}
        onBack={() => setViewMode("browse_templates")}
      />
    )
  }

  // Manual Form
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setViewMode("choice")}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Medication Manually</Text>
      </View>

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
              <SecondaryButton 
                title="Cancel" 
                onPress={() => setViewMode("choice")} 
                style={styles.secondaryButton} 
              />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  // Choice screen styles
  choiceContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  choiceTitle: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  choiceSubtitle: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
  },
  choiceOptions: {
    gap: 16,
    marginBottom: 32,
  },
  choiceOption: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  choiceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  choiceOptionTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 8,
  },
  choiceOptionDescription: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  cancelButton: {
    borderColor: "#94a3b8",
  },

  // Manual form styles
  container: { 
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    paddingVertical: 4,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: "OpenSans-SemiBold",
    color: "#7c3aed",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
  },
  form: { 
    backgroundColor: "#ffffff", 
    borderRadius: 16, 
    margin: 16,
    padding: 24, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 4 
  },
  inputContainer: { marginBottom: 24 },
  label: { 
    fontSize: 16, 
    fontFamily: "Montserrat-SemiBold", 
    color: "#1e293b", 
    marginBottom: 8 
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
    borderColor: "#e2e8f0" 
  },
  dosageContainer: { flexDirection: "row", gap: 12 },
  dosageAmountInput: { flex: 2 },
  dosageUnitInput: { flex: 1 },
  textArea: { height: 80, paddingTop: 14 },
  buttonContainer: { gap: 12, marginTop: 8 },
  primaryButton: { backgroundColor: "#7c3aed" },
  secondaryButton: { borderColor: "#7c3aed" },
})