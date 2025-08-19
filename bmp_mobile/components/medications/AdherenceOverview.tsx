"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Eye, EyeOff } from "../ui/Icons"
import { medicationsApi, Medication } from "../../services/medicationsApi"

interface MedicationWithAdherence extends Medication {
  adherenceRate: number
}

export function AdherenceOverview() {
  const [medications, setMedications] = useState<MedicationWithAdherence[]>([])
  const [showDetailed, setShowDetailed] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const meds = await medicationsApi.getMedications({ active: true })

        const medsWithAdherence: MedicationWithAdherence[] = await Promise.all(
          meds.map(async (med) => {
            const logs = await medicationsApi.getAdherenceLogs(med._id!)
            const total = logs.adherence.length
            const taken = logs.adherence.filter((l) => l.taken).length
            const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0
            return { ...med, adherenceRate }
          }),
        )

        setMedications(medsWithAdherence)
      } catch (error) {
        console.error("Failed to fetch adherence:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const averageAdherence = medications.length
    ? Math.round(medications.reduce((sum, med) => sum + med.adherenceRate, 0) / medications.length)
    : 0

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return "#059669"
    if (rate >= 75) return "#d97706"
    return "#dc2626"
  }

  if (loading) return <Text style={{ textAlign: "center", marginTop: 20 }}>Loading...</Text>

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Medication Adherence</Text>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setShowDetailed(!showDetailed)}>
          {showDetailed ? <EyeOff size={20} color="#7c3aed" /> : <Eye size={20} color="#7c3aed" />}
          <Text style={styles.toggleText}>{showDetailed ? "Simple View" : "Detailed View"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.overallCard}>
        <Text style={styles.overallTitle}>Overall Adherence</Text>
        <Text style={styles.overallValue}>{averageAdherence}%</Text>
        <Text style={styles.overallSubtext}>Across {medications.length} medications</Text>
      </View>

      {showDetailed ? (
        <View style={styles.circlesContainer}>
          {medications.map((med) => (
            <View key={med._id} style={styles.circleWrapper}>
              <View style={styles.circleContainer}>
                <View style={[styles.circleBackground, { borderColor: "#e2e8f0" }]} />
                <View
                  style={[
                    styles.circleProgress,
                    {
                      borderColor: getAdherenceColor(med.adherenceRate),
                      transform: [{ rotate: `${(med.adherenceRate / 100) * 360 - 90}deg` }],
                    },
                  ]}
                />
                <View style={styles.circleCenter}>
                  <Text style={[styles.adherencePercentage, { color: getAdherenceColor(med.adherenceRate) }]}>
                    {med.adherenceRate}%
                  </Text>
                </View>
              </View>
              <Text style={styles.medicationNameCircle}>{med.name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.listContainer}>
          {medications.map((med) => (
            <View key={med._id} style={styles.medicationCard}>
              <Text style={styles.medicationName}>{med.name}</Text>
              <View style={styles.adherenceBar}>
                <View
                  style={[
                    styles.adherenceProgress,
                    { width: `${med.adherenceRate}%`, backgroundColor: getAdherenceColor(med.adherenceRate) },
                  ]}
                />
              </View>
              <Text style={styles.adherenceText}>{med.adherenceRate}%</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 20, fontFamily: "Montserrat-Bold", color: "#1e293b" },
  toggleButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#f3e8ff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  toggleText: { fontSize: 12, fontFamily: "OpenSans-SemiBold", color: "#7c3aed" },
  overallCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  overallTitle: { fontSize: 16, fontFamily: "Montserrat-SemiBold", color: "#1e293b", marginBottom: 8 },
  overallValue: { fontSize: 36, fontFamily: "Montserrat-Bold", color: "#7c3aed", marginBottom: 4 },
  overallSubtext: { fontSize: 14, fontFamily: "OpenSans-Regular", color: "#64748b" },
  circlesContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", gap: 16 },
  circleWrapper: { alignItems: "center", marginBottom: 20 },
  circleContainer: { width: 120, height: 120, position: "relative", alignItems: "center", justifyContent: "center" },
  circleBackground: { position: "absolute", width: 120, height: 120, borderRadius: 60, borderWidth: 8 },
  circleProgress: { position: "absolute", width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderTopColor: "transparent", borderRightColor: "transparent", borderBottomColor: "transparent" },
  circleCenter: { position: "absolute", alignItems: "center", justifyContent: "center" },
  adherencePercentage: { fontSize: 18, fontFamily: "Montserrat-Bold" },
  medicationNameCircle: { fontSize: 14, fontFamily: "Montserrat-SemiBold", color: "#1e293b", textAlign: "center", marginTop: 8, maxWidth: 120 },
  listContainer: { gap: 16 },
  medicationCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  medicationName: { fontSize: 16, fontFamily: "Montserrat-SemiBold", color: "#1e293b", marginBottom: 12 },
  adherenceBar: { height: 8, backgroundColor: "#e2e8f0", borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  adherenceProgress: { height: "100%", borderRadius: 4 },
  adherenceText: { fontSize: 14, fontFamily: "Montserrat-SemiBold", color: "#1e293b", textAlign: "right" },
})
