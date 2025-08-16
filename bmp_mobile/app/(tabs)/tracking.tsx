"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BPChart } from "../../components/bp/BPChart"
import { ExerciseTracker } from "../../components/lifestyle/ExerciseTracker"
import { ActivityHistory } from "../../components/lifestyle/ActivityHistory"
import { Plus, BarChart3, List, Activity } from "../../components/ui/Icons"

type ViewMode = "bp-entry" | "bp-history" | "bp-chart" | "activity-entry" | "activity-history"

export default function TrackingScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("bp-entry")
  const [trackingType, setTrackingType] = useState<"bp" | "activity">("bp")

  const renderContent = () => {
    switch (viewMode) {
      case "bp-chart":
        return <BPChart />
      case "activity-entry":
        return <ExerciseTracker onBack={() => setViewMode("activity-history")} />
      case "activity-history":
        return <ActivityHistory />
      default:
        return <BPChart />
    }
  }

  const renderTrackingTypeSelector = () => (
    <View style={styles.typeSelector}>
      <TouchableOpacity
        style={[styles.typeButton, trackingType === "bp" && styles.activeTypeButton]}
        onPress={() => {
          setTrackingType("bp")
          setViewMode("bp-entry")
        }}
      >
        <Text style={[styles.typeButtonText, trackingType === "bp" && styles.activeTypeButtonText]}>
          Blood Pressure
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.typeButton, trackingType === "activity" && styles.activeTypeButton]}
        onPress={() => {
          setTrackingType("activity")
          setViewMode("activity-history")
        }}
      >
        <Activity size={16} color={trackingType === "activity" ? "#ffffff" : "#64748b"} />
        <Text style={[styles.typeButtonText, trackingType === "activity" && styles.activeTypeButtonText]}>
          Activities
        </Text>
      </TouchableOpacity>
    </View>
  )

  const getHeaderContent = () => {
    if (trackingType === "activity") {
      return {
        title: "Activity Tracking",
        subtitle: "Log and monitor your daily activities",
      }
    }
    return {
      title: "Blood Pressure Tracking",
      subtitle: "Monitor and manage your readings",
    }
  }

  const headerContent = getHeaderContent()

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#059669", "#10b981"]} style={styles.header}>
        <Text style={styles.headerTitle}>{headerContent.title}</Text>
        <Text style={styles.headerSubtitle}>{headerContent.subtitle}</Text>
      </LinearGradient>

      {renderTrackingTypeSelector()}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {trackingType === "bp" ? (
          <>
            <TouchableOpacity
              style={[styles.tab, viewMode === "bp-entry" && styles.activeTab]}
              onPress={() => setViewMode("bp-entry")}
            >
              <Plus size={20} color={viewMode === "bp-entry" ? "#059669" : "#64748b"} />
              <Text style={[styles.tabText, viewMode === "bp-entry" && styles.activeTabText]}>Add Reading</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, viewMode === "bp-history" && styles.activeTab]}
              onPress={() => setViewMode("bp-history")}
            >
              <List size={20} color={viewMode === "bp-history" ? "#059669" : "#64748b"} />
              <Text style={[styles.tabText, viewMode === "bp-history" && styles.activeTabText]}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, viewMode === "bp-chart" && styles.activeTab]}
              onPress={() => setViewMode("bp-chart")}
            >
              <BarChart3 size={20} color={viewMode === "bp-chart" ? "#059669" : "#64748b"} />
              <Text style={[styles.tabText, viewMode === "bp-chart" && styles.activeTabText]}>Charts</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.tab, viewMode === "activity-entry" && styles.activeTab]}
              onPress={() => setViewMode("activity-entry")}
            >
              <Plus size={20} color={viewMode === "activity-entry" ? "#059669" : "#64748b"} />
              <Text style={[styles.tabText, viewMode === "activity-entry" && styles.activeTabText]}>Log Activity</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, viewMode === "activity-history" && styles.activeTab]}
              onPress={() => setViewMode("activity-history")}
            >
              <List size={20} color={viewMode === "activity-history" ? "#059669" : "#64748b"} />
              <Text style={[styles.tabText, viewMode === "activity-history" && styles.activeTabText]}>History</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
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
  headerTitle: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#ffffff",
    opacity: 0.9,
  },
  typeSelector: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 24,
    marginTop: -32,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTypeButton: {
    backgroundColor: "#059669",
  },
  typeButtonText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  activeTypeButtonText: {
    color: "#ffffff",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 24,
    marginTop: 0,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#ecfdf5",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  activeTabText: {
    color: "#059669",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  bottomPadding: {
    height: 32,
  },
})
