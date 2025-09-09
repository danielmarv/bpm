"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { activitiesApi, type Activity } from "../../services/activitiesApi"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { Activity as ActivityIcon, Apple, Scale, Clock, Zap } from "../ui/Icons"

interface LifestyleOverviewProps {
  onNavigate: (section: "exercise" | "diet" | "weight") => void
}

interface ActivityStats {
  totalActivities: number
  totalDuration: number
  totalCalories: number
  weeklyGoal: number
  weeklyProgress: number
}

export function LifestyleOverview({ onNavigate }: LifestyleOverviewProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ActivityStats>({
    totalActivities: 0,
    totalDuration: 0,
    totalCalories: 0,
    weeklyGoal: 150, // 150 minutes per week recommended
    weeklyProgress: 0,
  })
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Get activities from the last 7 days
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      const activities = await activitiesApi.getActivities({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })

      // Calculate stats
      const exerciseActivities = activities.filter((a) => a.type === "exercise")
      const totalDuration = exerciseActivities.reduce((sum, activity) => {
        return sum + (activity.data?.duration || 0)
      }, 0)

      const totalCalories = exerciseActivities.reduce((sum, activity) => {
        return sum + (activity.data?.calories || 0)
      }, 0)

      setStats((prev) => ({
        ...prev,
        totalActivities: exerciseActivities.length,
        totalDuration,
        totalCalories,
        weeklyProgress: Math.min((totalDuration / prev.weeklyGoal) * 100, 100),
      }))

      // Get recent activities (last 5)
      setRecentActivities(activities.slice(0, 5))
    } catch (error) {
      console.error("Failed to load lifestyle data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "exercise":
        return <ActivityIcon size={16} color="#059669" />
      case "diet":
        return <Apple size={16} color="#f59e0b" />
      case "weight":
        return <Scale size={16} color="#8b5cf6" />
      default:
        return <ActivityIcon size={16} color="#64748b" />
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading your lifestyle data...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Weekly Progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Weekly Exercise Goal</Text>
          <Text style={styles.progressSubtitle}>
            {stats.totalDuration} / {stats.weeklyGoal} minutes
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${stats.weeklyProgress}%` }]} />
          </View>
          <Text style={styles.progressPercentage}>{Math.round(stats.weeklyProgress)}%</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <ActivityIcon size={24} color="#059669" />
          </View>
          <Text style={styles.statValue}>{stats.totalActivities}</Text>
          <Text style={styles.statLabel}>Activities</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Clock size={24} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{stats.totalDuration}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Zap size={24} color="#f59e0b" />
          </View>
          <Text style={styles.statValue}>{stats.totalCalories}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate("exercise")}>
            <View style={[styles.actionIcon, { backgroundColor: "#ecfdf5" }]}>
              <ActivityIcon size={24} color="#059669" />
            </View>
            <Text style={styles.actionTitle}>Log Exercise</Text>
            <Text style={styles.actionSubtitle}>Track your workout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate("diet")}>
            <View style={[styles.actionIcon, { backgroundColor: "#fef3c7" }]}>
              <Apple size={24} color="#f59e0b" />
            </View>
            <Text style={styles.actionTitle}>Log Diet</Text>
            <Text style={styles.actionSubtitle}>Record your meals</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate("weight")}>
            <View style={[styles.actionIcon, { backgroundColor: "#f3e8ff" }]}>
              <Scale size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.actionTitle}>Log Weight</Text>
            <Text style={styles.actionSubtitle}>Track your weight</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {recentActivities.length > 0 ? (
          <View style={styles.activitiesList}>
            {recentActivities.map((activity, index) => (
              <View key={activity._id || index} style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  {getActivityIcon(activity.type)}
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityName}>{activity.data?.type || activity.type}</Text>
                    <Text style={styles.activityDate}>{formatDate(activity.date)}</Text>
                  </View>
                </View>
                <View style={styles.activityRight}>
                  {activity.data?.duration && <Text style={styles.activityDuration}>{activity.data.duration} min</Text>}
                  {activity.data?.calories && <Text style={styles.activityCalories}>{activity.data.calories} cal</Text>}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent activities</Text>
            <Text style={styles.emptySubtext}>Start logging your activities to see them here</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  loadingText: { fontSize: 16, fontFamily: "OpenSans-Regular", color: "#64748b", marginTop: 16 },
  progressCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  progressHeader: { marginBottom: 16 },
  progressTitle: { fontSize: 18, fontFamily: "Montserrat-Bold", color: "#1e293b", marginBottom: 4 },
  progressSubtitle: { fontSize: 14, fontFamily: "OpenSans-Regular", color: "#64748b" },
  progressBarContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressBarBackground: { flex: 1, height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#059669", borderRadius: 4 },
  progressPercentage: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#059669",
    minWidth: 40,
    textAlign: "right",
  },
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 20, fontFamily: "Montserrat-Bold", color: "#1e293b", marginBottom: 4 },
  statLabel: { fontSize: 12, fontFamily: "OpenSans-Regular", color: "#64748b" },
  actionsContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontFamily: "Montserrat-Bold", color: "#1e293b", marginBottom: 16 },
  actionsGrid: { flexDirection: "row", gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 4,
    textAlign: "center",
  },
  actionSubtitle: { fontSize: 12, fontFamily: "OpenSans-Regular", color: "#64748b", textAlign: "center" },
  recentContainer: { marginBottom: 24 },
  activitiesList: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activityLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  activityDetails: { marginLeft: 12, flex: 1 },
  activityName: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 2,
    textTransform: "capitalize",
  },
  activityDate: { fontSize: 12, fontFamily: "OpenSans-Regular", color: "#64748b" },
  activityRight: { alignItems: "flex-end" },
  activityDuration: { fontSize: 12, fontFamily: "OpenSans-SemiBold", color: "#059669", marginBottom: 2 },
  activityCalories: { fontSize: 12, fontFamily: "OpenSans-Regular", color: "#64748b" },
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: { fontSize: 16, fontFamily: "Montserrat-SemiBold", color: "#64748b", marginBottom: 8 },
  emptySubtext: { fontSize: 14, fontFamily: "OpenSans-Regular", color: "#94a3b8", textAlign: "center" },
})
