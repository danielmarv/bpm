"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { bloodPressureApi, type BloodPressureReading } from "../../services/bloodPressureApi"

export function BPChart() {
  const [readings, setReadings] = useState<BloodPressureReading[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"3d" | "2d">("2d")

  useEffect(() => {
    loadReadings()
  }, [])

  const loadReadings = async () => {
    try {
      setLoading(true)
      const response = await bloodPressureApi.getReadings({ limit: 10, page: 1 })
      setReadings(response.readings)
    } catch (error) {
      console.error("Error loading BP readings:", error)
      setReadings([])
    } finally {
      setLoading(false)
    }
  }

  const renderSimpleChart = () => {
    if (readings.length === 0) {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No readings yet</Text>
          <Text style={styles.placeholderSubtext}>Add your first blood pressure reading</Text>
        </View>
      )
    }

    const maxSystolic = Math.max(...readings.map((r) => r.systolic))
    const minSystolic = Math.min(...readings.map((r) => r.systolic))
    const maxDiastolic = Math.max(...readings.map((r) => r.diastolic))
    const minDiastolic = Math.min(...readings.map((r) => r.diastolic))

    const chartWidth = Dimensions.get("window").width - 88
    const chartHeight = 180

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {readings.map((reading, index) => {
            const systolicHeight =
              ((reading.systolic - minSystolic) / (maxSystolic - minSystolic || 1)) * chartHeight * 0.8
            const diastolicHeight =
              ((reading.diastolic - minDiastolic) / (maxDiastolic - minDiastolic || 1)) * chartHeight * 0.8

            return (
              <View key={reading.id || index} style={styles.barGroup}>
                <View style={[styles.bar, styles.systolicBar, { height: systolicHeight || 20 }]} />
                <View style={[styles.bar, styles.diastolicBar, { height: diastolicHeight || 20 }]} />
                <Text style={styles.dateLabel}>{new Date(reading.timestamp).getDate()}</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.readingsSummary}>
          <Text style={styles.summaryTitle}>Latest Reading</Text>
          <Text style={styles.summaryValue}>
            {readings[readings.length - 1]?.systolic}/{readings[readings.length - 1]?.diastolic} mmHg
          </Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Blood Pressure Trends</Text>
        </View>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Loading readings...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blood Pressure Trends</Text>
        {/* Optional toggle button for viewMode */}
      </View>

      {renderSimpleChart()}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#dc2626" }]} />
          <Text style={styles.legendText}>Systolic</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#2563eb" }]} />
          <Text style={styles.legendText}>Diastolic</Text>
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
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  chartContainer: {
    marginBottom: 16,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 180,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  barGroup: {
    alignItems: "center",
    gap: 2,
  },
  bar: {
    width: 12,
    borderRadius: 6,
    marginBottom: 2,
  },
  systolicBar: {
    backgroundColor: "#dc2626",
  },
  diastolicBar: {
    backgroundColor: "#2563eb",
  },
  dateLabel: {
    fontSize: 10,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginTop: 4,
  },
  readingsSummary: {
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#059669",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#059669",
  },
  placeholder: {
    height: 200,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#64748b",
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#94a3b8",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
})
