"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ProtectedRoute } from "../../components/auth/ProtectedRoute"
import { useAuth } from "../../contexts/AuthContext"
import { SystemOverview } from "../../components/admin/SystemOverview"
import { UserManagement } from "../../components/admin/UserManagement"
import { SystemSettings } from "../../components/admin/SystemSettings"
import { AdminReports } from "../../components/admin/AdminReports"
import { Shield, Users, Settings, BarChart3 } from "../../components/ui/Icons"

type AdminView = "overview" | "users" | "settings" | "reports"

export default function AdminScreen() {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState<AdminView>("overview")
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const renderContent = () => {
    switch (activeView) {
      case "users":
        return <UserManagement />
      case "settings":
        return <SystemSettings />
      case "reports":
        return <AdminReports />
      default:
        return <SystemOverview />
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <View style={styles.container}>
        <LinearGradient colors={["#dc2626", "#ef4444"]} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Admin Dashboard</Text>
              <Text style={styles.userName}>Welcome, {user?.profile.firstName}</Text>
            </View>
            <View style={styles.logoContainer}>
              <Shield size={32} color="#ffffff" />
            </View>
          </View>
        </LinearGradient>

        {/* Admin Navigation */}
        <View style={styles.navContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navScroll}>
            <TouchableOpacity
              style={[styles.navItem, activeView === "overview" && styles.activeNavItem]}
              onPress={() => setActiveView("overview")}
            >
              <BarChart3 size={20} color={activeView === "overview" ? "#dc2626" : "#64748b"} />
              <Text style={[styles.navText, activeView === "overview" && styles.activeNavText]}>Overview</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navItem, activeView === "users" && styles.activeNavItem]}
              onPress={() => setActiveView("users")}
            >
              <Users size={20} color={activeView === "users" ? "#dc2626" : "#64748b"} />
              <Text style={[styles.navText, activeView === "users" && styles.activeNavText]}>Users</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navItem, activeView === "reports" && styles.activeNavItem]}
              onPress={() => setActiveView("reports")}
            >
              <BarChart3 size={20} color={activeView === "reports" ? "#dc2626" : "#64748b"} />
              <Text style={[styles.navText, activeView === "reports" && styles.activeNavText]}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navItem, activeView === "settings" && styles.activeNavItem]}
              onPress={() => setActiveView("settings")}
            >
              <Settings size={20} color={activeView === "settings" ? "#dc2626" : "#64748b"} />
              <Text style={[styles.navText, activeView === "settings" && styles.activeNavText]}>Settings</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />}
        >
          {renderContent()}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </ProtectedRoute>
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
  navContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 24,
    marginTop: -12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  navScroll: {
    padding: 4,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    gap: 8,
  },
  activeNavItem: {
    backgroundColor: "#fef2f2",
  },
  navText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  activeNavText: {
    color: "#dc2626",
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
