import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { TrendingUp, TrendingDown } from "../ui/Icons"

interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}

export function StatsCard({ title, value, icon, trend, trendUp }: StatsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>{icon}</View>
        {trend && (
          <View style={[styles.trendContainer, trendUp ? styles.trendUp : styles.trendDown]}>
            {trendUp ? (
              <TrendingUp size={12} color={trendUp ? "#10b981" : "#ef4444"} />
            ) : (
              <TrendingDown size={12} color="#ef4444" />
            )}
            <Text style={[styles.trendText, trendUp ? styles.trendUpText : styles.trendDownText]}>{trend}</Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: "45%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  trendUp: {
    backgroundColor: "#ecfdf5",
  },
  trendDown: {
    backgroundColor: "#fef2f2",
  },
  trendText: {
    fontSize: 10,
    fontFamily: "OpenSans-SemiBold",
  },
  trendUpText: {
    color: "#10b981",
  },
  trendDownText: {
    color: "#ef4444",
  },
  value: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
})
