import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

interface FrequencySelectorProps {
  value: string
  onValueChange: (value: string) => void
}

const frequencies = [
  { label: "Once daily", value: "once_daily" },
  { label: "Twice daily", value: "twice_daily" },
  { label: "Three times daily", value: "three_times_daily" },
  { label: "Four times daily", value: "four_times_daily" },
  { label: "As needed", value: "as_needed" },
  { label: "Weekly", value: "weekly" },
]

export function FrequencySelector({ value, onValueChange }: FrequencySelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Frequency</Text>
      <View style={styles.optionsContainer}>
        {frequencies.map((frequency) => (
          <TouchableOpacity
            key={frequency.value}
            style={[styles.option, value === frequency.value && styles.selectedOption]}
            onPress={() => onValueChange(frequency.value)}
          >
            <Text style={[styles.optionText, value === frequency.value && styles.selectedOptionText]}>
              {frequency.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  selectedOption: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  optionText: {
    fontSize: 14,
    color: "#374151",
  },
  selectedOptionText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
})
