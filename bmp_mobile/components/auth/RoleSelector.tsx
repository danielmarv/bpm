import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { User, Stethoscope } from "../ui/Icons"

interface RoleSelectorProps {
  selectedRole: "patient" | "provider"
  onRoleChange: (role: "patient" | "provider") => void
}

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>I am a:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleOption, selectedRole === "patient" && styles.selectedRole]}
          onPress={() => onRoleChange("patient")}
          activeOpacity={0.7}
        >
          <View style={[styles.roleIcon, selectedRole === "patient" && styles.selectedIcon]}>
            <User size={24} color={selectedRole === "patient" ? "#ffffff" : "#64748b"} />
          </View>
          <Text style={[styles.roleText, selectedRole === "patient" && styles.selectedText]}>Patient</Text>
          <Text style={[styles.roleDescription, selectedRole === "patient" && styles.selectedDescription]}>
            Track my health data
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleOption, selectedRole === "provider" && styles.selectedRole]}
          onPress={() => onRoleChange("provider")}
          activeOpacity={0.7}
        >
          <View style={[styles.roleIcon, selectedRole === "provider" && styles.selectedIcon]}>
            <Stethoscope size={24} color={selectedRole === "provider" ? "#ffffff" : "#64748b"} />
          </View>
          <Text style={[styles.roleText, selectedRole === "provider" && styles.selectedText]}>Healthcare Provider</Text>
          <Text style={[styles.roleDescription, selectedRole === "provider" && styles.selectedDescription]}>
            Monitor patient data
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
  },
  roleOption: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedRole: {
    borderColor: "#059669",
    backgroundColor: "#ecfdf5",
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  selectedIcon: {
    backgroundColor: "#059669",
  },
  roleText: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 4,
  },
  selectedText: {
    color: "#059669",
  },
  roleDescription: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    textAlign: "center",
  },
  selectedDescription: {
    color: "#047857",
  },
})
