"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { TrendUp, TrendDown, Minus, Clock } from "../ui/Icons"
import { bloodPressureApi, type BloodPressureReading } from "../../services/bloodPressureApi"

interface BPReading extends BloodPressureReading {
  category: "normal" | "elevated" | "high" | "low"
}

export function RecentReadings() {
  const [readings, setReadings] = useState<BPReading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReadings()
  }, [])

  const loadReadings = async () => {
    try {
      setLoading(true)

      // Fetch last 10 readings from API
      const response = await bloodPressureApi.getReadings({ limit: 10, page: 1 })
      const apiReadings = response.readings.map((r) => ({
        ...r,
        category: getCategory(r.systolic, r.diastolic),
      }))

      setReadings(apiReadings)
    } catch (error) {
      console.error("Error fetching recent readings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCategory = (systolic: number, diastolic: number): BPReading["category"] => {
    if (systolic < 120 && diastolic < 80) return "normal"
    if (systolic < 130 && diastolic < 80) return "elevated"
    if (systolic >= 140 || diastolic >= 90) return "high"
    if (systolic < 90 || diastolic < 60) return "low"
    return "normal"
  }

  const getCategoryColor = (category: BPReading["category"]) => {
    switch (category) {
      case "normal":
        return "#059669"
      case "elevated":
        return "#f59e0b"
      case "high":
        return "#dc2626"
      case "low":
        return "#3b82f6"
      default:
        return "#6b7280"
    }
  }

  const getTrendIcon = (current: BPReading, previous?: BPReading) => {
    if (!previous) return <Minus size={16} color="#6b7280" />

    const currentAvg = (current.systolic + current.diastolic) / 2
    const previousAvg = (previous.systolic + previous.diastolic) / 2

    if (currentAvg > previousAvg + 2) return <TrendUp size={16} color="#dc2626" />
    if (currentAvg < previousAvg - 2) return <TrendDown size={16} color="#059669" />
    return <Minus size={16} color="#6b7280" />
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const renderReading = ({ item, index }: { item: BPReading; index: number }) => (
    <TouchableOpacity style={styles.readingCard}>
      <View style={styles.readingHeader}>
        <View style={styles.readingValues}>
          <Text style={styles.bpValue}>
            {item.systolic}/{item.diastolic}
          </Text>
          <Text style={styles.pulseValue}>♥ {item.pulse}</Text>
        </View>
        <View style={styles.readingMeta}>
          {getTrendIcon(item, readings[index + 1])}
          <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category) }]} />
        </View>
      </View>
      <View style={styles.readingFooter}>
        <View style={styles.timeContainer}>
          <Clock size={12} color="#6b7280" />
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        </View>
        <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Text>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Loading recent readings...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={readings}
        renderItem={renderReading}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />

      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View All Readings</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  readingCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  readingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  readingValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bpValue: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  pulseValue: {
    fontSize: 14,
    fontFamily: "OpenSans-Medium",
    color: "#dc2626",
  },
  readingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#6b7280",
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "OpenSans-Medium",
    textTransform: "capitalize",
  },
  loadingCard: {
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#6b7280",
  },
  viewAllButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#059669",
  },
})
