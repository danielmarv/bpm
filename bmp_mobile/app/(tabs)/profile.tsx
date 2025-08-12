"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../../contexts/AuthContext"
import { LifestyleOverview } from "../../components/lifestyle/LifestyleOverview"
import { ExerciseTracker } from "../../components/lifestyle/ExerciseTracker"
import { DietTracker } from "../../components/lifestyle/DietTracker"
import { WeightTracker } from "../../components/lifestyle/WeightTracker"
import { ProfileSettings } from "../../components/profile/ProfileSettings"
import { Activity, Apple, Scale, Settings } from "../../components/ui/Icons"

type ViewMode = "overview" | "exercise" | "diet" | "weight" | "settings"

export default function ProfileScreen() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>("overview")

  const renderContent = () => {
    switch (viewMode) {
      case "exercise":
        return <ExerciseTracker onBack={() => setViewMode("overview")} />
      case "diet":
        return <DietTracker onBack={() => setViewMode("overview")} />
      case "weight":
        return <WeightTracker onBack={() => setViewMode("overview")} />
      case "settings":
        return <ProfileSettings onBack={() => setViewMode("overview")} />
      default:
        return (
          <LifestyleOverview
            onExercisePress={() => setViewMode("exercise")}
            onDietPress={() => setViewMode("diet")}
            onWeightPress={() => setViewMode("weight")}
            onSettingsPress={() => setViewMode("settings")}
          />
        )
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#059669", "#10b981"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.profile.firstName?.charAt(0) || "U"}
                {user?.profile.lastName?.charAt(0) || ""}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.profile.firstName} {user?.profile.lastName}
              </Text>
              <Text style={styles.userRole}>{user?.role === "provider" ? "Healthcare Provider" : "Patient"}</Text>
            </View>
          </View>
          {viewMode === "overview" && (
            <TouchableOpacity style={styles.settingsButton} onPress={() => setViewMode("settings")}>
              <Settings size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Tab Navigation - Only show for overview */}
      {viewMode === "overview" && (
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]} onPress={() => setViewMode("overview")}>
            <Activity size={20} color="#059669" />
            <Text style={[styles.tabText, styles.activeTabText]}>Overview</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab} onPress={() => setViewMode("exercise")}>
            <Activity size={20} color="#64748b" />
            <Text style={styles.tabText}>Exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab} onPress={() => setViewMode("diet")}>
            <Apple size={20} color="#64748b" />
            <Text style={styles.tabText}>Diet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab} onPress={() => setViewMode("weight")}>
            <Scale size={20} color="#64748b" />
            <Text style={styles.tabText}>Weight</Text>
          </TouchableOpacity>
        </View>
      )}

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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#ffffff",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#ffffff",
    opacity: 0.9,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
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
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#ecfdf5",
  },
  tabText: {
    fontSize: 12,
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
