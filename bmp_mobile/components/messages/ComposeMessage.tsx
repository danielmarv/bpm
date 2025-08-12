"use client"

import { useState } from "react"
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from "react-native"
import { PrimaryButton, SecondaryButton } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
// import { PrioritySelector } from "./PrioritySelector"
// import { ProviderSelector } from "./ProviderSelector"

interface ComposeMessageProps {
  onMessageSent: () => void
  onCancel: () => void
}

export function ComposeMessage({ onMessageSent, onCancel }: ComposeMessageProps) {
  const [formData, setFormData] = useState({
    providerId: "",
    subject: "",
    message: "",
    priority: "normal" as "urgent" | "high" | "normal" | "low",
  })
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!formData.providerId || !formData.subject || !formData.message) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      Alert.alert("Success", "Message sent successfully", [
        {
          text: "OK",
          onPress: onMessageSent,
        },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text style={styles.title}>New Message</Text>

        {/* <View style={styles.inputContainer}>
          <Text style={styles.label}>To *</Text>
          <ProviderSelector
            selectedProviderId={formData.providerId}
            onProviderChange={(providerId) => updateFormData("providerId", providerId)}
          />
        </View> */}

        {/* <View style={styles.inputContainer}>
          <Text style={styles.label}>Priority</Text>
          <PrioritySelector
            selectedPriority={formData.priority}
            onPriorityChange={(priority) => updateFormData("priority", priority)}
          />
        </View> */}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Subject *</Text>
          <TextInput
            style={styles.input}
            value={formData.subject}
            onChangeText={(value) => updateFormData("subject", value)}
            placeholder="Enter message subject"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={formData.message}
            onChangeText={(value) => updateFormData("message", value)}
            placeholder="Type your message here..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
          {loading ? (
            <LoadingSpinner size="large" color="#2563eb" />
          ) : (
            <>
              <PrimaryButton title="Send Message" onPress={handleSend} style={styles.sendButton} />
              <SecondaryButton title="Cancel" onPress={onCancel} style={styles.cancelButton} />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  messageInput: {
    height: 120,
    paddingTop: 14,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  sendButton: {
    backgroundColor: "#2563eb",
  },
  cancelButton: {
    borderColor: "#2563eb",
  },
})
