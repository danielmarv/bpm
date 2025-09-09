import type React from "react"
import { View, Text, StyleSheet } from "react-native"

interface PatientStatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend: string
  trendUp: boolean
}

export const PatientStatsCard: React.FC<PatientStatsCardProps> = ({ title, value, icon, trend, trendUp }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={[styles.trend, { color: trendUp ? "#10b981" : "#ef4444" }]}>{trend}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginLeft: 8,
  },
  value: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  trend: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
  },
})
