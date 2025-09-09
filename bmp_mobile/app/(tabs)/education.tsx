"use client"

import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BookOpen, Video, FileText } from "../../components/ui/Icons"
import { resourceService, type Resource, type ResourceFilters } from "../../services/resourcesApi"
import { ResourceCard } from "../../components/resources/ResourceCard"

type ViewMode = "all" | "hypertension" | "diet" | "exercise" | "medication" | "lifestyle"

export default function ResourcesScreen() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeCategory, setActiveCategory] = useState<ViewMode>("all")
  const [error, setError] = useState<string | null>(null)

  const fetchResources = async (filters?: ResourceFilters) => {
    try {
      setLoading(true)
      const data = await resourceService.getResources(filters)
      setResources(data.resources)
      setError(null)
    } catch (err: any) {
      console.error("Error fetching resources:", err.message)
      setError(err.message || "Failed to fetch resources")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchResources(activeCategory === "all" ? {} : { category: activeCategory }).finally(() => setRefreshing(false))
  }, [activeCategory])

  const handleCategoryChange = (category: ViewMode) => {
    setActiveCategory(category)
    if (category === "all") {
      fetchResources()
    } else {
      fetchResources({ category })
    }
  }

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading resources...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchResources()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    if (resources.length === 0) {
      return (
        <View style={styles.centered}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No resources found</Text>
            <Text style={styles.emptySubtitle}>Try selecting a different category or check back later</Text>
          </View>
        </View>
      )
    }

    return (
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} tintColor="#059669" />
        }
      >
        {resources.map((item) => (
          <ResourceCard key={item._id} resource={item} />
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#047857" />

      <LinearGradient
        colors={["#047857", "#059669", "#10b981"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Educational Resources</Text>
          <Text style={styles.headerSubtitle}>Discover expert-curated content to improve your health journey</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {resources.length} {resources.length === 1 ? "resource" : "resources"} available
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {[
            { key: "all", label: "All", icon: BookOpen },
            { key: "hypertension", label: "Hypertension", icon: BookOpen },
            { key: "diet", label: "Diet", icon: FileText },
            { key: "exercise", label: "Exercise", icon: Video },
            { key: "medication", label: "Medication", icon: FileText },
            { key: "lifestyle", label: "Lifestyle", icon: BookOpen },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeCategory === tab.key && styles.activeTab]}
              onPress={() => handleCategoryChange(tab.key as ViewMode)}
              activeOpacity={0.7}
            >
              <tab.icon size={18} color={activeCategory === tab.key ? "#059669" : "#64748b"} />
              <Text style={[styles.tabText, activeCategory === tab.key && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {renderContent()}
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
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {},
  headerTitle: {
    fontSize: 28,
    fontFamily: "Montserrat-Bold",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#ffffff",
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 12,
  },
  statsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statsText: {
    color: "#ffffff",
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    opacity: 0.9,
  },
  tabContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  tabScrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    minWidth: 80,
  },
  activeTab: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  tabText: {
    fontSize: 13,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
    marginLeft: 6,
  },
  activeTabText: {
    color: "#059669",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    fontFamily: "OpenSans-Regular",
  },
  errorContainer: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#dc2626",
    marginBottom: 8,
  },
  errorText: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 20,
    fontFamily: "OpenSans-Regular",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontFamily: "OpenSans-SemiBold",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontFamily: "OpenSans-Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
})
