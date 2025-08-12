import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Clock, CheckCircle, Edit3 } from "../ui/Icons"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  nextDose: string
  adherenceRate: number
  isActive: boolean
}

interface MedicationCardProps {
  medication: Medication
  onLogDose: () => void
  onEdit: () => void
}

export function MedicationCard({ medication, onLogDose, onEdit }: MedicationCardProps) {
  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return "#059669"
    if (rate >= 75) return "#d97706"
    return "#dc2626"
  }

  return (
    <View style={[styles.container, !medication.isActive && styles.inactiveContainer]}>
      <View style={styles.header}>
        <View style={styles.medicationInfo}>
          <Text style={[styles.medicationName, !medication.isActive && styles.inactiveText]}>{medication.name}</Text>
          <Text style={styles.dosageInfo}>
            {medication.dosage} • {medication.frequency}
          </Text>
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Edit3 size={16} color="#64748b" />
        </TouchableOpacity>
      </View>

      {medication.isActive && (
        <>
          <View style={styles.nextDoseContainer}>
            <Clock size={16} color="#7c3aed" />
            <Text style={styles.nextDoseText}>Next dose: {medication.nextDose}</Text>
          </View>

          <View style={styles.adherenceContainer}>
            <View style={styles.adherenceInfo}>
              <Text style={styles.adherenceLabel}>Adherence Rate</Text>
              <Text style={[styles.adherenceRate, { color: getAdherenceColor(medication.adherenceRate) }]}>
                {medication.adherenceRate}%
              </Text>
            </View>
            <View style={styles.adherenceBar}>
              <View
                style={[
                  styles.adherenceProgress,
                  {
                    width: `${medication.adherenceRate}%`,
                    backgroundColor: getAdherenceColor(medication.adherenceRate),
                  },
                ]}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.logButton} onPress={onLogDose} activeOpacity={0.8}>
            <CheckCircle size={20} color="#ffffff" />
            <Text style={styles.logButtonText}>Log Dose</Text>
          </TouchableOpacity>
        </>
      )}

      {!medication.isActive && (
        <View style={styles.inactiveLabel}>
          <Text style={styles.inactiveLabelText}>Inactive</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  inactiveContainer: {
    backgroundColor: "#f8fafc",
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 4,
  },
  inactiveText: {
    color: "#64748b",
  },
  dosageInfo: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  nextDoseContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  nextDoseText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#7c3aed",
  },
  adherenceContainer: {
    marginBottom: 20,
  },
  adherenceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  adherenceLabel: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  adherenceRate: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  adherenceBar: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  adherenceProgress: {
    height: "100%",
    borderRadius: 3,
  },
  logButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  logButtonText: {
    fontSize: 16,
    fontFamily: "OpenSans-SemiBold",
    color: "#ffffff",
  },
  inactiveLabel: {
    alignSelf: "flex-start",
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveLabelText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
})
