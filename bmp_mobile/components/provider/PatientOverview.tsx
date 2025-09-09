"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { PatientStatsCard } from "./PatientStatsCard"
import { Users, Activity, AlertTriangle, TrendingUp } from "../ui/Icons"
import { providerApi, type ProviderStats } from "../../services/providerApi"

export function PatientOverview() {
  const [providerStats, setProviderStats] = useState<ProviderStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProviderStats = async () => {
      try {
        const stats = await providerApi.getProviderStats()
        setProviderStats(stats)
      } catch (error) {
        console.error("Failed to fetch provider stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProviderStats()
  }, [])

  if (loading || !providerStats) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading patient overview...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Patient Overview</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <PatientStatsCard
          title="Total Patients"
          value={providerStats.totalPatients.toString()}
          icon={<Users size={24} color="#0ea5e9" />}
          trend="+3 this month"
          trendUp={true}
        />
        <PatientStatsCard
          title="Active Patients"
          value={providerStats.activePatients.toString()}
          icon={<Activity size={24} color="#10b981" />}
          trend={`${Math.round((providerStats.activePatients / providerStats.totalPatients) * 100)}% active`}
          trendUp={true}
        />
        <PatientStatsCard
          title="Critical Alerts"
          value={providerStats.criticalAlerts.toString()}
          icon={<AlertTriangle size={24} color="#ef4444" />}
          trend="Needs attention"
          trendUp={false}
        />
        <PatientStatsCard
          title="Avg Compliance"
          value={`${providerStats.averageCompliance}%`}
          icon={<TrendingUp size={24} color="#8b5cf6" />}
          trend="+5% this week"
          trendUp={true}
        />
      </View>
    </ScrollView>
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
