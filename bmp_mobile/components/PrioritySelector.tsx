import { View, TouchableOpacity, Text, StyleSheet } from "react-native"

interface PrioritySelectorProps {
  selectedPriority: "normal" | "high" | "low"
  onPriorityChange: (priority: "normal" | "high" | "low") => void
}

export function PrioritySelector({
  selectedPriority,
  onPriorityChange,
}: PrioritySelectorProps) {
  const priorities: { label: string; value: "normal" | "high" | "low"; color: string }[] = [
    { label: "Normal", value: "normal", color: "#2563eb" },
    { label: "High", value: "high", color: "#dc2626" },
    { label: "Low", value: "low", color: "#16a34a" },
  ]

  return (
    <View style={styles.container}>
      {priorities.map((p) => (
        <TouchableOpacity
          key={p.value}
          style={[
            styles.button,
            {
              borderColor: selectedPriority === p.value ? p.color : "#e2e8f0",
              backgroundColor: selectedPriority === p.value ? p.color + "20" : "#f8fafc",
            },
          ]}
          onPress={() => onPriorityChange(p.value)}
        >
          <Text
            style={{
              color: selectedPriority === p.value ? p.color : "#1e293b",
              fontWeight: selectedPriority === p.value ? "700" : "500",
            }}
          >
            {p.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
})
