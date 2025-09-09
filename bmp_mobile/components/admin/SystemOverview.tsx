"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { StatsCard } from "./StatsCard"
import { Users, Activity, CheckCircle } from "../ui/Icons"
import { adminApi, type SystemStats } from "../../services/adminApi"

export function SystemOverview() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        const stats = await adminApi.getSystemStats()
        setSystemStats(stats)
      } catch (error) {
        console.error("Failed to fetch system stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSystemStats()
  }, [])

  if (loading || !systemStats) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading system overview...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>System Overview</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatsCard
          title="Total Users"
          value={systemStats.totalUsers.toLocaleString()}
          icon={<Users size={24} color="#059669" />}
          trend="+12%"
          trendUp={true}
        />
        <StatsCard
          title="Active Users"
          value={systemStats.activeUsers.toLocaleString()}
          icon={<Activity size={24} color="#3b82f6" />}
          trend="+8%"
          trendUp={true}
        />
        <StatsCard
          title="BP Readings"
          value={systemStats.totalReadings.toLocaleString()}
          icon={<Activity size={24} color="#8b5cf6" />}
          trend="+24%"
          trendUp={true}
        />
        <StatsCard
          title="System Health"
          value={`${systemStats.systemHealth}%`}
          icon={<CheckCircle size={24} color="#10b981" />}
          trend="Excellent"
          trendUp={true}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
})
