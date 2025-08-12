"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Medication3DSphere } from "../3d/Medication3DSphere"
import { Eye, EyeOff } from "../ui/Icons"

interface Medication {
  id: string
  name: string
  adherenceRate: number
}

export function AdherenceOverview() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [show3D, setShow3D] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    setMedications([
      { id: "1", name: "Lisinopril", adherenceRate: 92 },
      { id: "2", name: "Metoprolol", adherenceRate: 88 },
      { id: "3", name: "Amlodipine", adherenceRate: 95 },
    ])
  }, [])

  const averageAdherence = Math.round(medications.reduce((sum, med) => sum + med.adherenceRate, 0) / medications.length)

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Medication Adherence</Text>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setShow3D(!show3D)}>
          {show3D ? <EyeOff size={20} color="#7c3aed" /> : <Eye size={20} color="#7c3aed" />}
          <Text style={styles.toggleText}>{show3D ? "Hide 3D" : "Show 3D"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.overallCard}>
        <Text style={styles.overallTitle}>Overall Adherence</Text>
        <Text style={styles.overallValue}>{averageAdherence}%</Text>
        <Text style={styles.overallSubtext}>Across {medications.length} medications</Text>
      </View>

      {show3D ? (
        <View style={styles.spheresContainer}>
          {medications.map((medication) => (
            <View key={medication.id} style={styles.sphereWrapper}>
              <Medication3DSphere
                adherenceRate={medication.adherenceRate}
                medicationName={medication.name}
                width={180}
                height={180}
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.listContainer}>
          {medications.map((medication) => (
            <View key={medication.id} style={styles.medicationCard}>
              <Text style={styles.medicationName}>{medication.name}</Text>
              <View style={styles.adherenceBar}>
                <View
                  style={[
                    styles.adherenceProgress,
                    {
                      width: `${medication.adherenceRate}%`,
                      backgroundColor:
                        medication.adherenceRate >= 90
                          ? "#059669"
                          : medication.adherenceRate >= 75
                            ? "#d97706"
                            : "#dc2626",
                    },
                  ]}
                />
              </View>
              <Text style={styles.adherenceText}>{medication.adherenceRate}%</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  toggleText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#7c3aed",
  },
  overallCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  overallTitle: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 8,
  },
  overallValue: {
    fontSize: 36,
    fontFamily: "Montserrat-Bold",
    color: "#7c3aed",
    marginBottom: 4,
  },
  overallSubtext: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  spheresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 16,
  },
  sphereWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  listContainer: {
    gap: 16,
  },
  medicationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 12,
  },
  adherenceBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  adherenceProgress: {
    height: "100%",
    borderRadius: 4,
  },
  adherenceText: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    textAlign: "right",
  },
})
