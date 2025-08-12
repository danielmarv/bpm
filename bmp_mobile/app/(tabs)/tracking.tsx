"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
// import { BPEntryForm } from "../../components/bp/BPEntryForm"
// import { BPHistory } from "../../components/bp/BPHistory"
import { BPChart } from "../../components/bp/BPChart"
import { Plus, BarChart3, List } from "../../components/ui/Icons"

type ViewMode = "entry" | "history" | "chart"

export default function TrackingScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("entry")

  const renderContent = () => {
    switch (viewMode) {
      case "chart":
        return <BPChart />
      default:
        return <BPChart />
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#059669", "#10b981"]} style={styles.header}>
        <Text style={styles.headerTitle}>Blood Pressure Tracking</Text>
        <Text style={styles.headerSubtitle}>Monitor and manage your readings</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, viewMode === "entry" && styles.activeTab]}
          onPress={() => setViewMode("entry")}
        >
          <Plus size={20} color={viewMode === "entry" ? "#059669" : "#64748b"} />
          <Text style={[styles.tabText, viewMode === "entry" && styles.activeTabText]}>Add Reading</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, viewMode === "history" && styles.activeTab]}
          onPress={() => setViewMode("history")}
        >
          <List size={20} color={viewMode === "history" ? "#059669" : "#64748b"} />
          <Text style={[styles.tabText, viewMode === "history" && styles.activeTabText]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, viewMode === "chart" && styles.activeTab]}
          onPress={() => setViewMode("chart")}
        >
          <BarChart3 size={20} color={viewMode === "chart" ? "#059669" : "#64748b"} />
          <Text style={[styles.tabText, viewMode === "chart" && styles.activeTabText]}>Charts</Text>
        </TouchableOpacity>
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 24,
    marginTop: -12,
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
