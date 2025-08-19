import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Edit3, CheckCircle } from "../ui/Icons"
import { type Medication } from "../../services/medicationsApi"

interface MedicationCardProps {
  medication: Medication
  onLogDose: () => void
  onEdit: () => void
}

export function MedicationCard({ medication, onLogDose, onEdit }: MedicationCardProps) {
  return (
    <View style={[styles.container, !medication.active && styles.inactiveContainer]}>
      <View style={styles.header}>
        <View style={styles.medicationInfo}>
          <Text style={[styles.medicationName, !medication.active && styles.inactiveText]}>
            {medication.name}
          </Text>
          <Text style={styles.dosageInfo}>
            {medication.dosage.amount} {medication.dosage.unit} • {formatFrequency(medication.frequency)}
          </Text>
          <Text style={styles.startDate}>Started: {new Date(medication.startDate).toLocaleDateString()}</Text>
          {medication.reminderSchedule?.enabled && (
            <Text style={styles.reminderTimes}>
              Reminders: {medication.reminderSchedule.times.join(", ")}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Edit3 size={16} color="#64748b" />
        </TouchableOpacity>
      </View>

      {medication.active ? (
        <TouchableOpacity style={styles.logButton} onPress={onLogDose} activeOpacity={0.8}>
          <CheckCircle size={20} color="#ffffff" />
          <Text style={styles.logButtonText}>Log Dose</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.inactiveLabel}>
          <Text style={styles.inactiveLabelText}>Inactive</Text>
        </View>
      )}
    </View>
  )
}

// Helper to format frequency nicely
function formatFrequency(frequency: Medication["frequency"]) {
  switch (frequency) {
    case "once_daily":
      return "Once Daily"
    case "twice_daily":
      return "Twice Daily"
    case "three_times_daily":
      return "Three Times Daily"
    case "four_times_daily":
      return "Four Times Daily"
    case "as_needed":
      return "As Needed"
    case "custom":
      return "Custom"
    default:
      return frequency
  }
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
    marginBottom: 4,
  },
  startDate: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#94a3b8",
  },
  reminderTimes: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#059669",
    marginTop: 4,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
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
