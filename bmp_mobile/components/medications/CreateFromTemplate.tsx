"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { PrimaryButton, SecondaryButton } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { FrequencySelector } from "./FrequencySelector"
import { TimeSelector } from "./TimeSelector"
import { Calendar, ArrowLeft, Plus, Minus } from "../ui/Icons"
import { MedicationTemplate, medicationTemplatesApi } from "../../services/medicationTemplatesApi"
import { medicationsApi } from "../../services/medicationsApi"

interface CreateFromTemplateProps {
  template: MedicationTemplate
  onMedicationCreated: () => void
  onBack: () => void
}

export function CreateFromTemplate({ template, onMedicationCreated, onBack }: CreateFromTemplateProps) {
  const [loading, setLoading] = useState(false)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: template.defaultDuration ? calculateDefaultEndDate() : null,
    customizations: {
      name: template.name,
      dosage: {
        amount: template.dosage.amount,
        unit: template.dosage.unit,
      },
      frequency: template.frequency,
      instructions: template.instructions || "",
      reminderSchedule: {
        enabled: true,
        times: ["08:00"],
        daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
      },
    },
  })

  function calculateDefaultEndDate() {
    if (!template.defaultDuration) return null
    
    const start = new Date()
    const end = new Date(start)
    
    switch (template.defaultDuration.unit) {
      case "days":
        end.setDate(end.getDate() + template.defaultDuration.amount)
        break
      case "weeks":
        end.setDate(end.getDate() + template.defaultDuration.amount * 7)
        break
      case "months":
        end.setMonth(end.getMonth() + template.defaultDuration.amount)
        break
      case "years":
        end.setFullYear(end.getFullYear() + template.defaultDuration.amount)
        break
    }
    
    return end
  }

  const updateFormData = (section: string, field: string, value: any) => {
    if (section === "root") {
      setFormData(prev => ({ ...prev, [field]: value }))
    } else if (section === "customizations") {
      setFormData(prev => ({
        ...prev,
        customizations: {
          ...prev.customizations,
          [field]: value,
        },
      }))
    } else if (section === "dosage") {
      setFormData(prev => ({
        ...prev,
        customizations: {
          ...prev.customizations,
          dosage: {
            ...prev.customizations.dosage,
            [field]: value,
          },
        },
      }))
    } else if (section === "reminderSchedule") {
      setFormData(prev => ({
        ...prev,
        customizations: {
          ...prev.customizations,
          reminderSchedule: {
            ...prev.customizations.reminderSchedule,
            [field]: value,
          },
        },
      }))
    }
  }

  const handleCreateMedication = async () => {
    try {
      setLoading(true)

      const payload = {
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate?.toISOString(),
        customizations: formData.customizations,
      }

      await medicationTemplatesApi.createMedicationFromTemplate(template._id, payload)
      
      Alert.alert(
        "Success",
        "Medication added to your regimen successfully!",
        [{ text: "OK", onPress: onMedicationCreated }]
      )
    } catch (error) {
      console.error("Failed to create medication:", error)
      Alert.alert("Error", "Failed to create medication. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const addReminderTime = () => {
    const newTime = "08:00"
    updateFormData("reminderSchedule", "times", [
      ...formData.customizations.reminderSchedule.times,
      newTime,
    ])
  }

  const removeReminderTime = (index: number) => {
    const newTimes = formData.customizations.reminderSchedule.times.filter((_, i) => i !== index)
    updateFormData("reminderSchedule", "times", newTimes)
  }

  const updateReminderTime = (index: number, time: string) => {
    const newTimes = [...formData.customizations.reminderSchedule.times]
    newTimes[index] = time
    updateFormData("reminderSchedule", "times", newTimes)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add from Template</Text>
      </View>

      {/* Template Info */}
      <View style={styles.templateInfo}>
        <Text style={styles.templateName}>{template.name}</Text>
        <Text style={styles.templateCategory}>
          {template.category.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
        </Text>
        {template.description && (
          <Text style={styles.templateDescription}>{template.description}</Text>
        )}
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Medication Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Medication Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.customizations.name}
            onChangeText={(value) => updateFormData("customizations", "name", value)}
            placeholder="e.g., Lisinopril"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Dosage */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dosage *</Text>
          <View style={styles.dosageContainer}>
            <TextInput
              style={[styles.input, styles.dosageAmountInput]}
              value={formData.customizations.dosage.amount.toString()}
              onChangeText={(value) => updateFormData("dosage", "amount", parseFloat(value) || 0)}
              placeholder="10"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.dosageUnitInput]}
              value={formData.customizations.dosage.unit}
              onChangeText={(value) => updateFormData("dosage", "unit", value)}
              placeholder="mg"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Frequency */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Frequency *</Text>
          <FrequencySelector
            frequency={formData.customizations.frequency}
            onFrequencyChange={(value) => updateFormData("customizations", "frequency", value)}
          />
        </View>

        {/* Start Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Calendar size={20} color="#64748b" />
            <Text style={styles.dateButtonText}>{formatDate(formData.startDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* End Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>End Date (Optional)</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Calendar size={20} color="#64748b" />
            <Text style={styles.dateButtonText}>
              {formData.endDate ? formatDate(formData.endDate) : "No end date"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.customizations.instructions}
            onChangeText={(value) => updateFormData("customizations", "instructions", value)}
            placeholder="e.g., Take with food, avoid alcohol"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Reminder Schedule */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reminder Times</Text>
          <View style={styles.reminderToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                formData.customizations.reminderSchedule.enabled && styles.toggleButtonActive,
              ]}
              onPress={() =>
                updateFormData("reminderSchedule", "enabled", !formData.customizations.reminderSchedule.enabled)
              }
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  formData.customizations.reminderSchedule.enabled && styles.toggleButtonTextActive,
                ]}
              >
                {formData.customizations.reminderSchedule.enabled ? "Enabled" : "Disabled"}
              </Text>
            </TouchableOpacity>
          </View>

          {formData.customizations.reminderSchedule.enabled && (
            <View style={styles.reminderTimes}>
              {formData.customizations.reminderSchedule.times.map((time, index) => (
                <View key={index} style={styles.reminderTimeRow}>
                  <TimeSelector
                    time={time}
                    onTimeChange={(newTime) => updateReminderTime(index, newTime)}
                  />
                  {formData.customizations.reminderSchedule.times.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeTimeButton}
                      onPress={() => removeReminderTime(index)}
                    >
                      <Minus size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              {formData.customizations.reminderSchedule.times.length < 4 && (
                <TouchableOpacity style={styles.addTimeButton} onPress={addReminderTime}>
                  <Plus size={20} color="#7c3aed" />
                  <Text style={styles.addTimeText}>Add reminder time</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Template Info */}
        {template.commonSideEffects && template.commonSideEffects.length > 0 && (
          <View style={styles.templateSection}>
            <Text style={styles.sectionTitle}>Common Side Effects</Text>
            <View style={styles.tagsContainer}>
              {template.commonSideEffects.map((effect, index) => (
                <Text key={index} style={styles.tag}>
                  {effect}
                </Text>
              ))}
            </View>
          </View>
        )}

        {template.warnings && template.warnings.length > 0 && (
          <View style={styles.templateSection}>
            <Text style={styles.sectionTitle}>Warnings</Text>
            <View style={styles.tagsContainer}>
              {template.warnings.map((warning, index) => (
                <Text key={index} style={[styles.tag, styles.warningTag]}>
                  {warning}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <SecondaryButton title="Cancel" onPress={onBack} />
          <PrimaryButton
            title={loading ? "Adding..." : "Add Medication"}
            onPress={handleCreateMedication}
            disabled={loading || !formData.customizations.name.trim()}
          />
        </View>
      </ScrollView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false)
            if (selectedDate) {
              updateFormData("root", "startDate", selectedDate)
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false)
            if (selectedDate) {
              updateFormData("root", "endDate", selectedDate)
            }
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  templateInfo: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  templateName: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#7c3aed",
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    lineHeight: 20,
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    backgroundColor: "#ffffff",
    color: "#1e293b",
  },
  dosageContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dosageAmountInput: {
    flex: 1,
  },
  dosageUnitInput: {
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  dateButtonText: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#1e293b",
    marginLeft: 8,
  },
  reminderToggle: {
    marginBottom: 12,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignSelf: "flex-start",
  },
  toggleButtonActive: {
    backgroundColor: "#7c3aed",
  },
  toggleButtonText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  toggleButtonTextActive: {
    color: "#ffffff",
  },
  reminderTimes: {
    gap: 12,
  },
  reminderTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  removeTimeButton: {
    padding: 8,
  },
  addTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#7c3aed",
    borderRadius: 12,
    borderStyle: "dashed",
  },
  addTimeText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#7c3aed",
    marginLeft: 8,
  },
  templateSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#e0e7ff",
    borderRadius: 16,
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#3730a3",
  },
  warningTag: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 24,
  },
})