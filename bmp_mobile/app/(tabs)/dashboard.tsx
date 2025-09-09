"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../../contexts/AuthContext"
import { BPQuickEntry } from "../../components/bp/BPQuickEntry"
import { BPStatsCard } from "../../components/bp/BPStatsCard"
import { HealthOverview } from "../../components/dashboard/HealthOverview"
import { Heart, FileText } from "../../components/ui/Icons"

const { width } = Dimensions.get("window")

export default function DashboardScreen() {
  const { user } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [bpStats, setBpStats] = useState({
    latest: { systolic: 0, diastolic: 0, pulse: 0, timestamp: "" },
    average: { systolic: 0, diastolic: 0 },
    trend: "stable" as "improving" | "stable" | "concerning",
  })

  const onRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  useEffect(() => {
    // Replace this with actual API call
    setBpStats({
      latest: { systolic: 125, diastolic: 82, pulse: 74, timestamp: new Date().toISOString() },
      average: { systolic: 123, diastolic: 80 },
      trend: "stable",
    })
  }, [])

  const hasBpData = bpStats.latest.systolic > 0

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#059669", "#10b981"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.profile.firstName || "User"}</Text>
          </View>
          <View style={styles.logoContainer}>
            <Heart size={32} color="#ffffff" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />}
      >
        {!hasBpData ? (
          <View style={styles.emptyState}>
            <FileText size={48} color="#94a3b8" />
            <Text style={styles.emptyStateText}>No blood pressure data yet.</Text>
            <Text style={styles.emptyStateSubText}>Quickly add a reading using the Quick Entry section below.</Text>
            {refreshing && <ActivityIndicator size="small" color="#059669" style={{ marginTop: 8 }} />}
          </View>
        ) : (
          <>
            {/* Health Overview */}
            <HealthOverview stats={bpStats} />

            {/* Quick BP Entry */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Entry</Text>
              <BPQuickEntry onEntryComplete={onRefresh} />
            </View>

            {/* BP Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Blood Pressure Overview</Text>
              <BPStatsCard stats={bpStats} />
            </View>
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#ffffff",
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#ffffff",
    marginTop: 4,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 16,
  },
  bottomPadding: {
    height: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubText: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
  },
})
