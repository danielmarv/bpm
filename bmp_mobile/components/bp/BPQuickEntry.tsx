"use client"

import { useState } from "react"
import { View, Text, TextInput, StyleSheet, Alert } from "react-native"
import { PrimaryButton } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { bloodPressureApi } from "../../services/bloodPressureApi"

interface BPQuickEntryProps {
  onEntryComplete: () => void
}

export function BPQuickEntry({ onEntryComplete }: BPQuickEntryProps) {
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [pulse, setPulse] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!systolic || !diastolic) {
      Alert.alert("Error", "Please enter both systolic and diastolic values")
      return
    }

    const systolicNum = Number.parseInt(systolic)
    const diastolicNum = Number.parseInt(diastolic)
    const pulseNum = pulse ? Number.parseInt(pulse) : undefined

    if (systolicNum < 70 || systolicNum > 250 || diastolicNum < 40 || diastolicNum > 150) {
      Alert.alert("Error", "Please enter valid blood pressure values")
      return
    }

    try {
      setLoading(true)
      await bloodPressureApi.createReading({
        systolic: systolicNum,
        diastolic: diastolicNum,
        pulse: pulseNum,
        timestamp: new Date().toISOString(),
      })

      setSystolic("")
      setDiastolic("")
      setPulse("")
      Alert.alert("Success", "Blood pressure reading saved successfully")
      onEntryComplete()
    } catch (error) {
      console.error("Error saving BP reading:", error)
      Alert.alert("Error", "Failed to save reading. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Systolic</Text>
          <TextInput
            style={styles.input}
            value={systolic}
            onChangeText={setSystolic}
            placeholder="120"
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.inputUnit}>mmHg</Text>
        </View>

        <Text style={styles.separator}>/</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Diastolic</Text>
          <TextInput
            style={styles.input}
            value={diastolic}
            onChangeText={setDiastolic}
            placeholder="80"
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.inputUnit}>mmHg</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Pulse</Text>
          <TextInput
            style={styles.input}
            value={pulse}
            onChangeText={setPulse}
            placeholder="72"
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.inputUnit}>bpm</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {loading ? (
          <LoadingSpinner size="large" color="#059669" />
        ) : (
          <PrimaryButton title="Save Reading" onPress={handleSubmit} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  inputContainer: {
    flex: 1,
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
    marginBottom: 8,
  },
  input: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  inputUnit: {
    fontSize: 10,
    fontFamily: "OpenSans-Regular",
    color: "#94a3b8",
    marginTop: 4,
  },
  separator: {
    fontSize: 32,
    fontFamily: "Montserrat-Bold",
    color: "#e2e8f0",
    marginHorizontal: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 8,
  },
})
