"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, ScrollView, ActivityIndicator } from "react-native"
import { providerApi } from "../../services/providerApi"

interface Alert {
  id: string
  patientName: string
  type: "critical" | "warning" | "info"
  message: string
  timestamp: string
}

export const PatientAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const data = await providerApi.getPatientAlerts()
      setAlerts(data)
    } catch (error) {
      console.error("Failed to load alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "#dc3545"
      case "warning":
        return "#ffc107"
      default:
        return "#17a2b8"
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#333" }}>Patient Alerts</Text>
      <ScrollView style={{ maxHeight: 300 }}>
        {alerts.map((alert) => (
          <View
            key={alert.id}
            style={{
              backgroundColor: "#fff",
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
              borderLeftWidth: 4,
              borderLeftColor: getAlertColor(alert.type),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 4 }}>{alert.patientName}</Text>
            <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{alert.message}</Text>
            <Text style={{ fontSize: 10, color: "#999" }}>{new Date(alert.timestamp).toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
