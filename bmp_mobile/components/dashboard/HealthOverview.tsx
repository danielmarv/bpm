"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Eye, EyeOff, TrendUp, TrendDown, Minus } from "../ui/Icons"
import { useState, useEffect } from "react"
import { bloodPressureApi, type BloodPressureReading } from "../../services/bloodPressureApi"

interface BPStats {
  latest: BloodPressureReading
  average: { systolic: number; diastolic: number }
  trend: "improving" | "stable" | "concerning"
}

interface HealthOverviewProps {}

export function HealthOverview({}: HealthOverviewProps) {
  const [showDetailed, setShowDetailed] = useState(true)
  const [stats, setStats] = useState<BPStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBPStats()
  }, [])

  const fetchBPStats = async () => {
    try {
      setLoading(true)
      // Fetch latest BP readings
      const response = await bloodPressureApi.getReadings({ limit: 30, page: 1 })
      const readings = response.readings

      if (readings.length === 0) return

      const latest = readings[0]
      const avgSystolic = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length)
      const avgDiastolic = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length)

      // Determine trend based on last two readings
      let trend: BPStats["trend"] = "stable"
      if (readings.length >= 2) {
        const prevAvg = (readings[1].systolic + readings[1].diastolic) / 2
        const currAvg = (latest.systolic + latest.diastolic) / 2
        if (currAvg > prevAvg + 2) trend = "concerning"
        else if (currAvg < prevAvg - 2) trend = "improving"
      }

      setStats({
        latest,
        average: { systolic: avgSystolic, diastolic: avgDiastolic },
        trend,
      })
    } catch (error) {
      console.error("Error fetching BP stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { category: "Normal", color: "#059669" }
    if (systolic < 130 && diastolic < 80) return { category: "Elevated", color: "#d97706" }
    if (systolic < 140 || diastolic < 90) return { category: "Stage 1", color: "#dc2626" }
    return { category: "Stage 2", color: "#991b1b" }
  }

  const CircularProgress = ({ value, size = 80, strokeWidth = 8, color = "#059669" }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
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

  if (loading || !stats) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#64748b", fontFamily: "OpenSans-Regular" }}>Loading health overview...</Text>
      </View>
    )
  }

  const { category, color } = getBPCategory(stats.latest.systolic, stats.latest.diastolic)
  const overallScore = Math.round((stats.latest.systolic + stats.latest.diastolic) / 2) // Example BP-based score

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
              {stats.trend === "improving" ? <TrendUp size={16} color="#059669" /> : stats.trend === "concerning" ? <TrendDown size={16} color="#dc2626" /> : <Minus size={16} color="#64748b" />}
              <Text style={styles.trendText}>{stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1)}</Text>
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
            <Text style={styles.statSubtext}>BP-based</Text>
          </View>
        </View>
      )}
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
  statsGrid: {
    flexDirection: "row",
    gap: 16,
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
})
