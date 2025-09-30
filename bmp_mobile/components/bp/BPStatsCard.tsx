"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { TrendUp, TrendDown, Minus } from "../ui/Icons"
import { bloodPressureApi, type BloodPressureReading } from "../../services/bloodPressureApi"

const { width: screenWidth } = Dimensions.get("window")
const isSmallScreen = screenWidth < 375

interface BPStats {
  latest: BloodPressureReading
  average: { systolic: number; diastolic: number }
  trend: "improving" | "stable" | "concerning"
}

interface BPStatsCardProps {
  userId?: string
}

export function BPStatsCard({ userId }: BPStatsCardProps) {
  const [stats, setStats] = useState<BPStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)

      const readingsResponse = await bloodPressureApi.getReadings({ limit: 10, page: 1 })
      const readings = readingsResponse.readings

      const statsData = await bloodPressureApi.getReadingStats(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString(),
      )

      let trend: "improving" | "stable" | "concerning" = "stable"
      if (readings.length >= 2) {
        const last = readings[readings.length - 1]
        const prev = readings[readings.length - 2]
        if (last.systolic < prev.systolic && last.diastolic < prev.diastolic) trend = "improving"
        else if (last.systolic > prev.systolic || last.diastolic > prev.diastolic) trend = "concerning"
      }

      setStats({
        latest: readings[readings.length - 1],
        average: {
          systolic: statsData?.averageSystolic || 0,
          diastolic: statsData?.averageDiastolic || 0,
        },
        trend,
      })
    } catch (error) {
      console.error("Error loading BP stats:", error)
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

  const getTrendIcon = () => {
    switch (stats?.trend) {
      case "improving":
        return <TrendUp size={20} color="#059669" />
      case "concerning":
        return <TrendDown size={20} color="#dc2626" />
      default:
        return <Minus size={20} color="#64748b" />
    }
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading stats...</Text>
      </View>
    )
  }

  const { category, color } = getBPCategory(stats.latest.systolic, stats.latest.diastolic)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Current Status</Text>
        <View style={styles.trendContainer}>
          {getTrendIcon()}
          <Text
            style={[
              styles.trendText,
              {
                color: stats.trend === "improving" ? "#059669" : stats.trend === "concerning" ? "#dc2626" : "#64748b",
              },
            ]}
          >
            {stats.trend}
          </Text>
        </View>
      </View>

      <View style={styles.readingContainer}>
        <View style={styles.mainReading}>
          <Text style={styles.readingValue}>
            {stats.latest.systolic}/{stats.latest.diastolic}
          </Text>
          <Text style={styles.readingUnit}>mmHg</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: color }]}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pulse</Text>
          <Text style={styles.statValue}>{stats.latest.pulse} bpm</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>30-Day Avg</Text>
          <Text style={styles.statValue}>
            {stats.average.systolic}/{stats.average.diastolic}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: isSmallScreen ? 16 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: isSmallScreen ? 15 : 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: isSmallScreen ? 13 : 14,
    fontFamily: "OpenSans-SemiBold",
    textTransform: "capitalize",
  },
  readingContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  mainReading: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  readingValue: {
    fontSize: isSmallScreen ? 32 : 36,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
  },
  readingUnit: {
    fontSize: isSmallScreen ? 14 : 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginLeft: 8,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#ffffff",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: isSmallScreen ? 15 : 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
})
