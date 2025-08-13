"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Eye, EyeOff, TrendUp } from "../ui/Icons"
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
  const [showDetailed, setShowDetailed] = useState(true)

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

  const CircularProgress = ({ value, size = 80, strokeWidth = 8, color = "#059669" }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (value / 100) * circumference

    return (
      <View style={{ width: size, height: size, position: "relative" }}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: "#f1f5f9",
            position: "absolute",
          }}
        />
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: "transparent",
            borderRightColor: value > 25 ? color : "transparent",
            borderBottomColor: value > 50 ? color : "transparent",
            borderLeftColor: value > 75 ? color : "transparent",
            position: "absolute",
            transform: [{ rotate: "-90deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Montserrat-Bold",
              color: "#1e293b",
            }}
          >
            {value}
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "OpenSans-Regular",
              color: "#64748b",
            }}
          >
            Score
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Overview</Text>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setShowDetailed(!showDetailed)}>
          {showDetailed ? <EyeOff size={20} color="#059669" /> : <Eye size={20} color="#059669" />}
          <Text style={styles.toggleText}>{showDetailed ? "Simple" : "Detailed"}</Text>
        </TouchableOpacity>
      </View>

      {showDetailed ? (
        <View style={styles.detailedView}>
          <View style={styles.scoreContainer}>
            <CircularProgress value={overallScore} size={100} color="#059669" />
            <View style={styles.trendIndicator}>
              <TrendUp size={16} color="#059669" />
              <Text style={styles.trendText}>Improving</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <CircularProgress value={healthData.exercise} size={60} color="#2563eb" />
              <Text style={styles.metricLabel}>Exercise</Text>
            </View>
            <View style={styles.metricCard}>
              <CircularProgress value={healthData.diet} size={60} color="#d97706" />
              <Text style={styles.metricLabel}>Diet</Text>
            </View>
            <View style={styles.metricCard}>
              <CircularProgress value={healthData.weight} size={60} color="#7c3aed" />
              <Text style={styles.metricLabel}>Weight</Text>
            </View>
            <View style={styles.metricCard}>
              <CircularProgress value={healthData.bloodPressure} size={60} color="#dc2626" />
              <Text style={styles.metricLabel}>BP</Text>
            </View>
          </View>
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
  detailedView: {
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  trendIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#059669",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  metricCard: {
    alignItems: "center",
    width: "48%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
    marginTop: 8,
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
