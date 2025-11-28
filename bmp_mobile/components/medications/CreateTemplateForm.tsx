"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"
import { PrimaryButton, SecondaryButton } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { FrequencySelector } from "./FrequencySelector"
import { Plus, Minus, X } from "../ui/Icons"
import { medicationTemplatesApi, CreateTemplatePayload } from "../../services/medicationTemplatesApi"

interface CreateTemplateFormProps {
  onTemplateCreated: () => void
  onCancel: () => void
}

const CATEGORIES = [
  { value: "hypertension", label: "Hypertension" },
  { value: "diabetes", label: "Diabetes" },
  { value: "heart_disease", label: "Heart Disease" },
  { value: "cholesterol", label: "Cholesterol" },
  { value: "anxiety", label: "Anxiety" },
  { value: "depression", label: "Depression" },
  { value: "pain_relief", label: "Pain Relief" },
  { value: "antibiotics", label: "Antibiotics" },
  { value: "vitamins", label: "Vitamins & Supplements" },
  { value: "other", label: "Other" },
]

const DURATION_UNITS = [
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
]

export function CreateTemplateForm({ onTemplateCreated, onCancel }: CreateTemplateFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateTemplatePayload>({
    name: "",
    description: "",
    dosage: {
      amount: 0,
      unit: "mg",
    },
    frequency: "once_daily",
    category: "other",
    instructions: "",
    commonSideEffects: [],
    warnings: [],
    defaultDuration: {
      amount: 30,
      unit: "days",
    },
    isPublic: false,
    tags: [],
  })

  const [newSideEffect, setNewSideEffect] = useState("")
  const [newWarning, setNewWarning] = useState("")
  const [newTag, setNewTag] = useState("")

  const updateFormData = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CreateTemplatePayload],
          [child]: value,
        },
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const addListItem = (listName: "commonSideEffects" | "warnings" | "tags", value: string) => {
    if (!value.trim()) return
    
    const currentList = formData[listName] || []
    if (!currentList.includes(value.trim())) {
      updateFormData(listName, [...currentList, value.trim()])
    }
    
    // Clear the input
    if (listName === "commonSideEffects") setNewSideEffect("")
    if (listName === "warnings") setNewWarning("")
    if (listName === "tags") setNewTag("")
  }

  const removeListItem = (listName: "commonSideEffects" | "warnings" | "tags", index: number) => {
    const currentList = formData[listName] || []
    updateFormData(listName, currentList.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.dosage.amount || !formData.dosage.unit.trim()) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      await medicationTemplatesApi.createTemplate(formData)
      
      Alert.alert(
        "Success",
        "Medication template created successfully!",
        [{ text: "OK", onPress: onTemplateCreated }]
      )
    } catch (error) {
      console.error("Failed to create template:", error)
      Alert.alert("Error", "Failed to create template. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Template</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Template Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateFormData("name", value)}
              placeholder="e.g., Lisinopril for Hypertension"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateFormData("description", value)}
              placeholder="Brief description of this medication template..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryChip,
                    formData.category === category.value && styles.categoryChipActive,
                  ]}
                  onPress={() => updateFormData("category", category.value)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      formData.category === category.value && styles.categoryChipTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Dosage Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dosage Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Dosage *</Text>
            <View style={styles.dosageContainer}>
              <TextInput
                style={[styles.input, styles.dosageAmountInput]}
                value={formData.dosage.amount.toString()}
                onChangeText={(value) => updateFormData("dosage.amount", parseFloat(value) || 0)}
                placeholder="10"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.dosageUnitInput]}
                value={formData.dosage.unit}
                onChangeText={(value) => updateFormData("dosage.unit", value)}
                placeholder="mg"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Frequency *</Text>
            <FrequencySelector
              frequency={formData.frequency}
              onFrequencyChange={(value) => updateFormData("frequency", value)}
            />
          </View>
        </View>

        {/* Default Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Duration (Optional)</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.durationContainer}>
              <TextInput
                style={[styles.input, styles.durationAmountInput]}
                value={formData.defaultDuration?.amount.toString() || ""}
                onChangeText={(value) => updateFormData("defaultDuration.amount", parseInt(value) || 0)}
                placeholder="30"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.durationUnitScroll}>
                {DURATION_UNITS.map((unit) => (
                  <TouchableOpacity
                    key={unit.value}
                    style={[
                      styles.durationUnit,
                      formData.defaultDuration?.unit === unit.value && styles.durationUnitActive,
                    ]}
                    onPress={() => updateFormData("defaultDuration.unit", unit.value)}
                  >
                    <Text
                      style={[
                        styles.durationUnitText,
                        formData.defaultDuration?.unit === unit.value && styles.durationUnitTextActive,
                      ]}
                    >
                      {unit.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions & Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.instructions}
              onChangeText={(value) => updateFormData("instructions", value)}
              placeholder="e.g., Take with food, avoid alcohol..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Side Effects */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Common Side Effects</Text>
            <View style={styles.addItemContainer}>
              <TextInput
                style={[styles.input, styles.addItemInput]}
                value={newSideEffect}
                onChangeText={setNewSideEffect}
                placeholder="Add side effect..."
                placeholderTextColor="#94a3b8"
                onSubmitEditing={() => addListItem("commonSideEffects", newSideEffect)}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addListItem("commonSideEffects", newSideEffect)}
              >
                <Plus size={20} color="#7c3aed" />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {formData.commonSideEffects?.map((effect, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{effect}</Text>
                  <TouchableOpacity onPress={() => removeListItem("commonSideEffects", index)}>
                    <X size={14} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Warnings */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Warnings</Text>
            <View style={styles.addItemContainer}>
              <TextInput
                style={[styles.input, styles.addItemInput]}
                value={newWarning}
                onChangeText={setNewWarning}
                placeholder="Add warning..."
                placeholderTextColor="#94a3b8"
                onSubmitEditing={() => addListItem("warnings", newWarning)}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addListItem("warnings", newWarning)}
              >
                <Plus size={20} color="#7c3aed" />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {formData.warnings?.map((warning, index) => (
                <View key={index} style={[styles.tag, styles.warningTag]}>
                  <Text style={[styles.tagText, styles.warningTagText]}>{warning}</Text>
                  <TouchableOpacity onPress={() => removeListItem("warnings", index)}>
                    <X size={14} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.addItemContainer}>
              <TextInput
                style={[styles.input, styles.addItemInput]}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add tag..."
                placeholderTextColor="#94a3b8"
                onSubmitEditing={() => addListItem("tags", newTag)}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addListItem("tags", newTag)}
              >
                <Plus size={20} color="#7c3aed" />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {formData.tags?.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeListItem("tags", index)}>
                    <X size={14} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Sharing Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sharing Options</Text>
          
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => updateFormData("isPublic", !formData.isPublic)}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Make Public</Text>
              <Text style={styles.toggleDescription}>
                Allow other providers to use this template (requires admin approval)
              </Text>
            </View>
            <View style={[styles.toggle, formData.isPublic && styles.toggleActive]}>
              <View style={[styles.toggleThumb, formData.isPublic && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <SecondaryButton title="Cancel" onPress={onCancel} />
          <PrimaryButton
            title={loading ? "Creating..." : "Create Template"}
            onPress={handleSubmit}
            disabled={loading || !formData.name.trim()}
          />
        </View>
      </ScrollView>
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
  form: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    backgroundColor: "#ffffff",
    color: "#1e293b",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dosageContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dosageAmountInput: {
    flex: 2,
  },
  dosageUnitInput: {
    flex: 1,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  durationAmountInput: {
    flex: 1,
  },
  durationUnitScroll: {
    flex: 2,
  },
  durationUnit: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  durationUnitActive: {
    backgroundColor: "#7c3aed",
  },
  durationUnitText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  durationUnitTextActive: {
    color: "#ffffff",
  },
  categoryScroll: {
    maxHeight: 40,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#7c3aed",
  },
  categoryChipText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  categoryChipTextActive: {
    color: "#ffffff",
  },
  addItemContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  addItemInput: {
    flex: 1,
  },
  addButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  warningTag: {
    backgroundColor: "#fef2f2",
  },
  tagText: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#3730a3",
  },
  warningTagText: {
    color: "#dc2626",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#7c3aed",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 24,
  },
})