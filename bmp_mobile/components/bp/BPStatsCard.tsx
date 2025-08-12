import { View, Text, StyleSheet } from "react-native"
import { TrendUp, TrendDown, Minus } from "../ui/Icons"

interface BPStats {
  latest: { systolic: number; diastolic: number; pulse: number; timestamp: string }
  average: { systolic: number; diastolic: number }
  trend: "improving" | "stable" | "concerning"
}

interface BPStatsCardProps {
  stats: BPStats
}

export function BPStatsCard({ stats }: BPStatsCardProps) {
  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { category: "Normal", color: "#059669" }
    if (systolic < 130 && diastolic < 80) return { category: "Elevated", color: "#d97706" }
    if (systolic < 140 || diastolic < 90) return { category: "Stage 1", color: "#dc2626" }
    return { category: "Stage 2", color: "#991b1b" }
  }

  const getTrendIcon = () => {
    switch (stats.trend) {
      case "improving":
        return <TrendUp size={20} color="#059669" />
      case "concerning":
        return <TrendDown size={20} color="#dc2626" />
      default:
        return <Minus size={20} color="#64748b" />
    }
  }

  const { category, color } = getBPCategory(stats.latest.systolic, stats.latest.diastolic)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Current Status</Text>
        <View style={styles.trendContainer}>
          {getTrendIcon()}
          <Text
            style={[
              styles.trendText,
              { color: stats.trend === "improving" ? "#059669" : stats.trend === "concerning" ? "#dc2626" : "#64748b" },
            ]}
          >
            {stats.trend}
          </Text>
        </View>
      </View>

      <View style={styles.readingContainer}>
        <View style={styles.mainReading}>
          <Text style={styles.readingValue}>
            {stats.latest.systolic}/{stats.latest.diastolic}
          </Text>
          <Text style={styles.readingUnit}>mmHg</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: color }]}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pulse</Text>
          <Text style={styles.statValue}>{stats.latest.pulse} bpm</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>30-Day Avg</Text>
          <Text style={styles.statValue}>
            {stats.average.systolic}/{stats.average.diastolic}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    textTransform: "capitalize",
  },
  readingContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  mainReading: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  readingValue: {
    fontSize: 36,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
  },
  readingUnit: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginLeft: 8,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#ffffff",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
})
