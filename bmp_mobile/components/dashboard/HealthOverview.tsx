"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Health3DSphere } from "../3d/Health3DSphere"
import { Eye, EyeOff } from "../ui/Icons"
import { useState } from "react"

interface BPStats {
  latest: { systolic: number; diastolic: number; pulse: number; timestamp: string }
  average: { systolic: number; diastolic: number }
  trend: "improving" | "stable" | "concerning"
}

interface HealthOverviewProps {
  stats: BPStats
}

export function HealthOverview({ stats }: HealthOverviewProps) {
  const [show3D, setShow3D] = useState(true)

  // Mock health data - in real app, this would come from various sources
  const healthData = {
    exercise: 75, // Based on weekly activity
    diet: 68, // Based on nutrition tracking
    weight: 82, // Based on weight trends
    bloodPressure: 85, // Based on BP readings
  }

  const overallScore = Math.round(
    (healthData.exercise + healthData.diet + healthData.weight + healthData.bloodPressure) / 4,
  )

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { category: "Normal", color: "#059669" }
    if (systolic < 130 && diastolic < 80) return { category: "Elevated", color: "#d97706" }
    if (systolic < 140 || diastolic < 90) return { category: "Stage 1", color: "#dc2626" }
    return { category: "Stage 2", color: "#991b1b" }
  }

  const { category, color } = getBPCategory(stats.latest.systolic, stats.latest.diastolic)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Overview</Text>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setShow3D(!show3D)}>
          {show3D ? <EyeOff size={20} color="#059669" /> : <Eye size={20} color="#059669" />}
          <Text style={styles.toggleText}>{show3D ? "Hide 3D" : "Show 3D"}</Text>
        </TouchableOpacity>
      </View>

      {show3D ? (
        <View style={styles.visualizationContainer}>
          <Health3DSphere healthData={healthData} overallScore={overallScore} width={280} height={220} />
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats.latest.systolic}/{stats.latest.diastolic}
            </Text>
            <Text style={styles.statLabel}>Blood Pressure</Text>
            <View style={[styles.categoryBadge, { backgroundColor: color }]}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{overallScore}</Text>
            <Text style={styles.statLabel}>Health Score</Text>
            <Text style={styles.statSubtext}>out of 100</Text>
          </View>
        </View>
      )}

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <View style={[styles.metricDot, { backgroundColor: "#2563eb" }]} />
          <Text style={styles.metricText}>Exercise {healthData.exercise}%</Text>
        </View>
        <View style={styles.metricItem}>
          <View style={[styles.metricDot, { backgroundColor: "#d97706" }]} />
          <Text style={styles.metricText}>Diet {healthData.diet}%</Text>
        </View>
        <View style={styles.metricItem}>
          <View style={[styles.metricDot, { backgroundColor: "#7c3aed" }]} />
          <Text style={styles.metricText}>Weight {healthData.weight}%</Text>
        </View>
        <View style={styles.metricItem}>
          <View style={[styles.metricDot, { backgroundColor: "#dc2626" }]} />
          <Text style={styles.metricText}>BP {healthData.bloodPressure}%</Text>
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
  visualizationContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginBottom: 8,
  },
  statSubtext: {
    fontSize: 10,
    fontFamily: "OpenSans-Regular",
    color: "#94a3b8",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: "OpenSans-SemiBold",
    color: "#ffffff",
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricText: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
})
