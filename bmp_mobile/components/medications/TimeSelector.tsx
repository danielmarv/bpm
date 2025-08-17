"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native"
import { Plus, Minus } from "../ui/Icons"

interface TimeSelectorProps {
  frequency: string
  selectedTimes: string[]
  onTimesChange: (times: string[]) => void
}

export function TimeSelector({ frequency, selectedTimes, onTimesChange }: TimeSelectorProps) {
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedHour, setSelectedHour] = useState(8)
  const [selectedMinute, setSelectedMinute] = useState(0)

  const addTime = () => {
    const timeString = `${selectedHour.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`
    if (!selectedTimes.includes(timeString)) {
      onTimesChange([...selectedTimes, timeString].sort())
    }
    setShowTimePicker(false)
  }

  const removeTime = (timeToRemove: string) => {
    onTimesChange(selectedTimes.filter((time) => time !== timeToRemove))
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 15, 30, 45]

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Reminder Times</Text>

      <View style={styles.timesContainer}>
        {selectedTimes.map((time) => (
          <View key={time} style={styles.timeChip}>
            <Text style={styles.timeText}>{time}</Text>
            <TouchableOpacity onPress={() => removeTime(time)}>
              <Minus size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={() => setShowTimePicker(true)}>
          <Plus size={16} color="#8B5CF6" />
          <Text style={styles.addButtonText}>Add Time</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showTimePicker} transparent animationType="slide" onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>

            <View style={styles.pickerContainer}>
              <View style={styles.picker}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <ScrollView style={styles.scrollPicker} showsVerticalScrollIndicator={false}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[styles.pickerOption, selectedHour === hour && styles.selectedPickerOption]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text style={[styles.pickerOptionText, selectedHour === hour && styles.selectedPickerOptionText]}>
                        {hour.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.picker}>
                <Text style={styles.pickerLabel}>Minute</Text>
                <ScrollView style={styles.scrollPicker} showsVerticalScrollIndicator={false}>
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[styles.pickerOption, selectedMinute === minute && styles.selectedPickerOption]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text
                        style={[styles.pickerOptionText, selectedMinute === minute && styles.selectedPickerOptionText]}
                      >
                        {minute.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowTimePicker(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={addTime}>
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  timesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: "#374151",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#8B5CF6",
    borderRadius: 16,
    borderStyle: "dashed",
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: "#8B5CF6",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  picker: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  scrollPicker: {
    maxHeight: 120,
  },
  pickerOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  selectedPickerOption: {
    backgroundColor: "#8B5CF6",
  },
  pickerOptionText: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
  },
  selectedPickerOptionText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#8B5CF6",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
    textAlign: "center",
  },
})
