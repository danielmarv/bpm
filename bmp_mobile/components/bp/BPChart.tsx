"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { BP3DChart } from "../3d/BP3DChart"
import { BarChart3, TrendingUp } from "../ui/Icons"

interface BPReading {
  systolic: number
  diastolic: number
  timestamp: string
}

export function BPChart() {
  const [readings, setReadings] = useState<BPReading[]>([])
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d")

  useEffect(() => {
    // Mock data - replace with actual API call
    setReadings([
      { systolic: 125, diastolic: 82, timestamp: "2024-01-10T08:00:00Z" },
      { systolic: 128, diastolic: 85, timestamp: "2024-01-11T08:00:00Z" },
      { systolic: 122, diastolic: 80, timestamp: "2024-01-12T08:00:00Z" },
      { systolic: 130, diastolic: 88, timestamp: "2024-01-13T08:00:00Z" },
      { systolic: 126, diastolic: 83, timestamp: "2024-01-14T08:00:00Z" },
      { systolic: 124, diastolic: 81, timestamp: "2024-01-15T08:00:00Z" },
    ])
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blood Pressure Trends</Text>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setViewMode(viewMode === "3d" ? "2d" : "3d")}>
          {viewMode === "3d" ? <BarChart3 size={20} color="#059669" /> : <TrendingUp size={20} color="#059669" />}
          <Text style={styles.toggleText}>{viewMode === "3d" ? "2D View" : "3D View"}</Text>
        </TouchableOpacity>
      </View>

      {viewMode === "3d" ? (
        <BP3DChart readings={readings} width={300} height={200} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>2D Chart View</Text>
          <Text style={styles.placeholderSubtext}>Traditional chart visualization</Text>
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#dc2626" }]} />
          <Text style={styles.legendText}>Systolic</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#2563eb" }]} />
          <Text style={styles.legendText}>Diastolic</Text>
        </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  toggleText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#059669",
  },
  placeholder: {
    height: 200,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#64748b",
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#94a3b8",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
})
