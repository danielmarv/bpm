import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Activity, Calendar, TrendingUp, AlertTriangle } from "../ui/Icons"

interface Patient {
  _id: string
  profile: {
    firstName: string
    lastName: string
    dateOfBirth: string
  }
  email: string
  lastReading: {
    systolic: number
    diastolic: number
    timestamp: string
  }
  riskLevel: "low" | "medium" | "high"
  compliance: number
}

interface PatientCardProps {
  patient: Patient
}

export function PatientCard({ patient }: PatientCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "#ef4444"
      case "medium":
        return "#f59e0b"
      default:
        return "#10b981"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertTriangle size={16} color="#ef4444" />
      case "medium":
        return <TrendingUp size={16} color="#f59e0b" />
      default:
        return <TrendingUp size={16} color="#10b981" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.patientInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {patient.profile.firstName[0]}
            {patient.profile.lastName[0]}
          </Text>
        </View>
        <View style={styles.patientDetails}>
          <Text style={styles.patientName}>
            {patient.profile.firstName} {patient.profile.lastName}
          </Text>
          <Text style={styles.patientAge}>
            Age {getAge(patient.profile.dateOfBirth)} • {patient.email}
          </Text>
          <View style={styles.patientMeta}>
            <View style={styles.readingInfo}>
              <Activity size={14} color="#64748b" />
              <Text style={styles.readingText}>
                {patient.lastReading.systolic}/{patient.lastReading.diastolic} mmHg
              </Text>
            </View>
            <View style={styles.dateInfo}>
              <Calendar size={14} color="#64748b" />
              <Text style={styles.dateText}>{formatDate(patient.lastReading.timestamp)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.patientStats}>
        <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(patient.riskLevel)}20` }]}>
          {getRiskIcon(patient.riskLevel)}
          <Text style={[styles.riskText, { color: getRiskColor(patient.riskLevel) }]}>{patient.riskLevel} risk</Text>
        </View>
        <View style={styles.complianceInfo}>
          <Text style={styles.complianceLabel}>Compliance</Text>
          <Text
            style={[
              styles.complianceValue,
              { color: patient.compliance >= 80 ? "#10b981" : patient.compliance >= 60 ? "#f59e0b" : "#ef4444" },
            ]}
          >
            {patient.compliance}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  patientInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#475569",
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 2,
  },
  patientAge: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginBottom: 8,
  },
  patientMeta: {
    flexDirection: "row",
    gap: 16,
  },
  readingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readingText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  patientStats: {
    alignItems: "flex-end",
    gap: 8,
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  riskText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    textTransform: "capitalize",
  },
  complianceInfo: {
    alignItems: "center",
  },
  complianceLabel: {
    fontSize: 10,
    fontFamily: "OpenSans-Regular",
    color: "#94a3b8",
    marginBottom: 2,
  },
  complianceValue: {
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
  },
})
