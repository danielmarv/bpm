"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native"
import { PrimaryButton, SecondaryButton } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { ArrowLeft, Clock, Zap } from "../ui/Icons"
import { activitiesApi } from "../../services/activitiesApi"

interface ExerciseTrackerProps {
  onBack: () => void
}

export function ExerciseTracker({ onBack }: ExerciseTrackerProps) {
  const [formData, setFormData] = useState({
    activity: "",
    duration: "",
    intensity: "moderate" as "low" | "moderate" | "high",
    calories: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  const activities = [
    "Walking",
    "Running",
    "Cycling",
    "Swimming",
    "Yoga",
    "Weight Training",
    "Dancing",
    "Tennis",
    "Basketball",
    "Other",
  ]

  const handleSubmit = async () => {
    if (!formData.activity || !formData.duration) {
      Alert.alert("Error", "Please fill in activity and duration")
      return
    }

    try {
      setLoading(true)

      const activityData = {
        type: formData.activity.toLowerCase().replace(/\s+/g, "_"),
        duration: Number.parseInt(formData.duration),
        intensity: formData.intensity,
        ...(formData.calories && { calories: Number.parseInt(formData.calories) }),
        ...(formData.notes && { notes: formData.notes }),
      }

      await activitiesApi.logActivity(activityData)

      Alert.alert("Success", "Exercise logged successfully", [
        {
          text: "OK",
          onPress: () => {
            setFormData({
              activity: "",
              duration: "",
              intensity: "moderate",
              calories: "",
              notes: "",
            })
            onBack()
          },
        },
      ])
    } catch (error) {
      console.error("Failed to log exercise:", error)
      Alert.alert("Error", "Failed to log exercise. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Log Exercise</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Activity *</Text>
          <View style={styles.activitiesGrid}>
            {activities.map((activity) => (
              <TouchableOpacity
                key={activity}
                style={[styles.activityChip, formData.activity === activity && styles.selectedChip]}
                onPress={() => setFormData((prev) => ({ ...prev, activity }))}
              >
                <Text style={[styles.chipText, formData.activity === activity && styles.selectedChipText]}>
                  {activity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration (minutes) *</Text>
          <View style={styles.inputWrapper}>
            <Clock size={20} color="#64748b" />
            <TextInput
              style={styles.input}
              value={formData.duration}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
              placeholder="30"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Intensity</Text>
          <View style={styles.intensityContainer}>
            {(["low", "moderate", "high"] as const).map((intensity) => (
              <TouchableOpacity
                key={intensity}
                style={[styles.intensityButton, formData.intensity === intensity && styles.selectedIntensity]}
                onPress={() => setFormData((prev) => ({ ...prev, intensity }))}
              >
                <Zap
                  size={16}
                  color={formData.intensity === intensity ? "#ffffff" : "#64748b"}
                  fill={formData.intensity === intensity ? "#ffffff" : "none"}
                />
                <Text style={[styles.intensityText, formData.intensity === intensity && styles.selectedIntensityText]}>
                  {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Calories Burned (optional)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.calories}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, calories: value }))}
            placeholder="300"
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.notes}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, notes: value }))}
            placeholder="How did you feel during the workout?"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.buttonContainer}>
          {loading ? (
            <LoadingSpinner size="large" color="#2563eb" />
          ) : (
            <>
              <PrimaryButton title="Log Exercise" onPress={handleSubmit} style={styles.submitButton} />
              <SecondaryButton title="Cancel" onPress={onBack} />
            </>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontFamily: "Montserrat-Bold", color: "#1e293b" },
  placeholder: { width: 40 },
  form: { backgroundColor: "#ffffff", borderRadius: 16, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 16, fontFamily: "Montserrat-SemiBold", color: "#1e293b", marginBottom: 12 },
  activitiesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  activityChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
  selectedChip: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  chipText: { fontSize: 14, fontFamily: "OpenSans-SemiBold", color: "#64748b" },
  selectedChipText: { color: "#ffffff" },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1, borderColor: "#e2e8f0" },
  input: { flex: 1, fontSize: 16, fontFamily: "OpenSans-Regular", color: "#1e293b", paddingVertical: 12, paddingLeft: 12 },
  textInput: { fontSize: 16, fontFamily: "OpenSans-Regular", color: "#1e293b", backgroundColor: "#f8fafc", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  textArea: { height: 80, paddingTop: 14 },
  intensityContainer: { flexDirection: "row", gap: 12 },
  intensityButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0", gap: 8 },
  selectedIntensity: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  intensityText: { fontSize: 14, fontFamily: "OpenSans-SemiBold", color: "#64748b" },
  selectedIntensityText: { color: "#ffffff" },
  buttonContainer: { gap: 12, marginTop: 8 },
  submitButton: { backgroundColor: "#2563eb" },
})
