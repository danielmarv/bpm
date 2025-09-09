import type React from "react"
import { View, Text } from "react-native"

interface ProviderStatsProps {
  totalPatients: number
  activePatients: number
  criticalAlerts: number
  completedAssignments: number
}

export const ProviderStats: React.FC<ProviderStatsProps> = ({
  totalPatients,
  activePatients,
  criticalAlerts,
  completedAssignments,
}) => {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
      <View
        style={{
          flex: 1,
          minWidth: 150,
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#007bff", marginBottom: 4 }}>{totalPatients}</Text>
        <Text style={{ fontSize: 14, color: "#666" }}>Total Patients</Text>
      </View>

      <View
        style={{
          flex: 1,
          minWidth: 150,
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#28a745", marginBottom: 4 }}>{activePatients}</Text>
        <Text style={{ fontSize: 14, color: "#666" }}>Active Patients</Text>
      </View>

      <View
        style={{
          flex: 1,
          minWidth: 150,
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#dc3545", marginBottom: 4 }}>{criticalAlerts}</Text>
        <Text style={{ fontSize: 14, color: "#666" }}>Critical Alerts</Text>
      </View>

      <View
        style={{
          flex: 1,
          minWidth: 150,
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#ffc107", marginBottom: 4 }}>
          {completedAssignments}
        </Text>
        <Text style={{ fontSize: 14, color: "#666" }}>Assignments</Text>
      </View>
    </View>
  )
}
