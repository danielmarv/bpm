"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MedicationList } from "../../components/medications/MedicationList"
import { AddMedicationForm } from "../../components/medications/AddMedicationForm"
import { AdherenceOverview } from "../../components/medications/AdherenceOverview"
import { Plus, Pill, BarChart3 } from "../../components/ui/Icons"

type ViewMode = "list" | "add" | "adherence"

export default function MedicationsScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  const renderContent = () => {
    switch (viewMode) {
      case "add":
        return <AddMedicationForm onMedicationAdded={() => setViewMode("list")} />
      case "adherence":
        return <AdherenceOverview />
      default:
        return <MedicationList onAddMedication={() => setViewMode("add")} />
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#7c3aed", "#8b5cf6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Medications</Text>
        <Text style={styles.headerSubtitle}>Manage your medication regimen</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, viewMode === "list" && styles.activeTab]}
          onPress={() => setViewMode("list")}
        >
          <Pill size={20} color={viewMode === "list" ? "#7c3aed" : "#64748b"} />
          <Text style={[styles.tabText, viewMode === "list" && styles.activeTabText]}>My Meds</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, viewMode === "add" && styles.activeTab]}
          onPress={() => setViewMode("add")}
        >
          <Plus size={20} color={viewMode === "add" ? "#7c3aed" : "#64748b"} />
          <Text style={[styles.tabText, viewMode === "add" && styles.activeTabText]}>Add New</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, viewMode === "adherence" && styles.activeTab]}
          onPress={() => setViewMode("adherence")}
        >
          <BarChart3 size={20} color={viewMode === "adherence" ? "#7c3aed" : "#64748b"} />
          <Text style={[styles.tabText, viewMode === "adherence" && styles.activeTabText]}>Adherence</Text>
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
    backgroundColor: "#f3e8ff",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  activeTabText: {
    color: "#7c3aed",
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
