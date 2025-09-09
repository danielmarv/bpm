"use client";

import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Video, FileText } from "../../components/ui/Icons";
import { resourceService, Resource, ResourceFilters } from "../../services/resourcesApi"; // <- Make sure path matches
import { ResourceCard } from "../../components/resources/ResourceCard";

type ViewMode = "all" | "hypertension" | "diet" | "exercise" | "medication" | "lifestyle";

export default function ResourcesScreen() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ViewMode>("all");
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async (filters?: ResourceFilters) => {
    try {
      setLoading(true);
      const data = await resourceService.getResources(filters);
      setResources(data.resources);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching resources:", err.message);
      setError(err.message || "Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchResources(activeCategory === "all" ? {} : { category: activeCategory }).finally(() =>
      setRefreshing(false)
    );
  }, [activeCategory]);

  const handleCategoryChange = (category: ViewMode) => {
    setActiveCategory(category);
    if (category === "all") {
      fetchResources();
    } else {
      fetchResources({ category });
    }
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return <ActivityIndicator size="large" color="#059669" style={{ marginTop: 32 }} />;
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchResources()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (resources.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No resources found</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {resources.map((item) => (
          <ResourceCard key={item._id} resource={item} />
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#059669", "#10b981"]} style={styles.header}>
        <Text style={styles.headerTitle}>Educational Resources</Text>
        <Text style={styles.headerSubtitle}>
          Learn how to manage your health and well-being
        </Text>
      </LinearGradient>

      {/* Category Tabs */}
      <View style={styles.tabContainer}>
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
          >
            <tab.icon size={18} color={activeCategory === tab.key ? "#059669" : "#64748b"} />
            <Text
              style={[styles.tabText, activeCategory === tab.key && styles.activeTabText]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
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
    marginHorizontal: 16,
    marginTop: -12,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    flexWrap: "wrap",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    margin: 4,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#d1fae5",
  },
  tabText: {
    fontSize: 13,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  activeTabText: {
    color: "#059669",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
    marginBottom: 12,
    fontFamily: "OpenSans-SemiBold",
  },
  retryButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontFamily: "OpenSans-SemiBold",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    fontFamily: "OpenSans-Regular",
  },
  bottomPadding: {
    height: 32,
  },
});
