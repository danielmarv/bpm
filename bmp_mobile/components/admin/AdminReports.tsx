"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, ScrollView, ActivityIndicator } from "react-native"
import { adminApi } from "../../services/adminApi"

interface ReportData {
  totalUsers: number
  activeUsers: number
  totalReadings: number
  averageReadings: number
  systemHealth: string
}

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const data = await adminApi.getSystemStats()
      setReports(data)
    } catch (error) {
      console.error("Failed to load reports:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#dc3545" />
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#dc3545" }}>System Reports</Text>

      {reports && (
        <View>
          <View
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#333" }}>User Statistics</Text>
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Total Users: {reports.totalUsers}</Text>
            <Text style={{ fontSize: 14, color: "#666" }}>Active Users: {reports.activeUsers}</Text>
          </View>

          <View
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#333" }}>Health Data</Text>
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
              Total Readings: {reports.totalReadings}
            </Text>
            <Text style={{ fontSize: 14, color: "#666" }}>Average per User: {reports.averageReadings}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  )
}
