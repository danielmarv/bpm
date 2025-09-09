"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { PatientOverview } from "./PatientOverview"
import { PatientList } from "./PatientList"
import { ProviderStats } from "./ProviderStats"
import { PatientAlerts } from "./PatientAlerts"
import { Users, Activity, AlertTriangle, BarChart3 } from "../ui/Icons"

type ProviderView = "overview" | "patients" | "alerts" | "stats"

export function ProviderDashboard() {
  const [activeView, setActiveView] = useState<ProviderView>("overview")

  const renderContent = () => {
    switch (activeView) {
      case "patients":
        return <PatientList />
      case "alerts":
        return <PatientAlerts />
      case "stats":
        return <ProviderStats
                
                />
      default:
        return <PatientOverview />
    }
  }

  return (
    <View style={styles.container}>
      {/* Provider Navigation */}
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={[styles.navItem, activeView === "overview" && styles.activeNavItem]}
          onPress={() => setActiveView("overview")}
        >
          <BarChart3 size={20} color={activeView === "overview" ? "#0ea5e9" : "#64748b"} />
          <Text style={[styles.navText, activeView === "overview" && styles.activeNavText]}>Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === "patients" && styles.activeNavItem]}
          onPress={() => setActiveView("patients")}
        >
          <Users size={20} color={activeView === "patients" ? "#0ea5e9" : "#64748b"} />
          <Text style={[styles.navText, activeView === "patients" && styles.activeNavText]}>Patients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === "alerts" && styles.activeNavItem]}
          onPress={() => setActiveView("alerts")}
        >
          <AlertTriangle size={20} color={activeView === "alerts" ? "#0ea5e9" : "#64748b"} />
          <Text style={[styles.navText, activeView === "alerts" && styles.activeNavText]}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === "stats" && styles.activeNavItem]}
          onPress={() => setActiveView("stats")}
        >
          <Activity size={20} color={activeView === "stats" ? "#0ea5e9" : "#64748b"} />
          <Text style={[styles.navText, activeView === "stats" && styles.activeNavText]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 24,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  navItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 8,
  },
  activeNavItem: {
    backgroundColor: "#eff6ff",
  },
  navText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  activeNavText: {
    color: "#0ea5e9",
  },
  content: {
    flex: 1,
  },
})
