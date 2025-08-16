"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import { activitiesApi } from "../../services/activitiesApi"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { Calendar, Clock, Zap, Filter } from "../ui/Icons"

interface Activity {
  id: string
  type: string
  date: string
  data: {
    type?: string
    duration?: number
    intensity?: string
    calories?: number
    notes?: string
  }
}

export function ActivityHistory() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<"all" | "exercise" | "diet" | "weight">("all")

  const loadActivities = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)

      const filterType = filter === "all" ? undefined : filter
      const response = await activitiesApi.getActivities({ type: filterType })
      setActivities(response.activities || [])
    } catch (error) {
      console.error("Failed to load activities:", error)
      setActivities([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [filter])

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
        return <Zap size={20} color="#059669" />
      case "diet":
        return <Calendar size={20} color="#dc2626" />
      case "weight":
        return <Filter size={20} color="#7c3aed" />
      default:
        return <Calendar size={20} color="#64748b" />
    }
  }

  const renderActivity = (activity: Activity) => (
    <View key={activity.id} style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={styles.activityInfo}>
          {getActivityIcon(activity.type)}
          <View style={styles.activityDetails}>
            <Text style={styles.activityType}>{activity.data.type || activity.type}</Text>
            <Text style={styles.activityDate}>{formatDate(activity.date)}</Text>
          </View>
        </View>
        {activity.data.duration && (
          <View style={styles.durationBadge}>
            <Clock size={14} color="#64748b" />
            <Text style={styles.durationText}>{activity.data.duration}min</Text>
          </View>
        )}
      </View>

      {activity.data.intensity && (
        <View style={styles.intensityContainer}>
          <Text style={styles.intensityLabel}>Intensity:</Text>
          <Text
            style={[
              styles.intensityValue,
              activity.data.intensity === "high" && styles.highIntensity,
              activity.data.intensity === "moderate" && styles.moderateIntensity,
              activity.data.intensity === "low" && styles.lowIntensity,
            ]}
          >
            {activity.data.intensity}
          </Text>
        </View>
      )}

      {activity.data.calories && <Text style={styles.caloriesText}>🔥 {activity.data.calories} calories burned</Text>}

      {activity.data.notes && <Text style={styles.notesText}>{activity.data.notes}</Text>}
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(["all", "exercise", "diet", "weight"] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[styles.filterTab, filter === filterType && styles.activeFilterTab]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadActivities(true)} colors={["#059669"]} />
        }
      >
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptySubtitle}>Start logging your activities to see them here</Text>
          </View>
        ) : (
          activities.map(renderActivity)
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  activeFilterTab: {
    backgroundColor: "#ecfdf5",
  },
  filterText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  activeFilterText: {
    color: "#059669",
  },
  scrollView: {
    flex: 1,
  },
  activityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activityInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityDetails: {
    marginLeft: 12,
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    textTransform: "capitalize",
  },
  activityDate: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginTop: 2,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  intensityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  intensityLabel: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginRight: 8,
  },
  intensityValue: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    textTransform: "capitalize",
  },
  highIntensity: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
  },
  moderateIntensity: {
    backgroundColor: "#fffbeb",
    color: "#d97706",
  },
  lowIntensity: {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
  },
  caloriesText: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#475569",
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginTop: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    textAlign: "center",
  },
})
