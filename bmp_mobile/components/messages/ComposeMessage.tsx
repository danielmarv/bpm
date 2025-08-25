"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { messagesApi } from "../../services/messagesApi"
import { usersApi, User } from "../../services/usersApi"
import { ProviderSelector } from "../ProviderSelector"
import { PrioritySelector } from "../PrioritySelector"

export function ComposeMessage({ navigation }: any) {
  const [formData, setFormData] = useState({
    providerId: "",
    subject: "",
    body: "",
    priority: "normal" as "normal" | "high" | "low",
  })

  const [sending, setSending] = useState(false)
  const [providers, setProviders] = useState<User[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)

  // Load providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoadingProviders(true)
        const allProviders = await usersApi.getAllUsers({ role: "provider" })
        setProviders(allProviders)
      } catch (err) {
        console.error("Failed to load providers:", err)
        Alert.alert("Error", "Failed to load providers")
      } finally {
        setLoadingProviders(false)
      }
    }
    fetchProviders()
  }, [])

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSend = async () => {
    if (!formData.providerId || !formData.subject || !formData.body) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    try {
      setSending(true)
      await messagesApi.sendMessage({
        receiverId: formData.providerId,
        subject: formData.subject,
        body: formData.body,
        priority: formData.priority,
      })
      Alert.alert("Success", "Message sent successfully")
      navigation.goBack()
    } catch (error) {
      console.error("Error sending message:", error)
      Alert.alert("Error", "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Compose Message</Text>

      {/* Provider Selector */}
      <View style={styles.inputContainer}>
        {loadingProviders ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : (
          <ProviderSelector
            providers={providers}
            selectedProviderId={formData.providerId}
            onProviderChange={(id) => updateFormData("providerId", id)}
          />
        )}
      </View>

      {/* Priority Selector */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Priority</Text>
        <PrioritySelector
          selectedPriority={formData.priority}
          onPriorityChange={(priority) => updateFormData("priority", priority)}
        />
      </View>

      {/* Subject */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Subject *</Text>
        <TextInput
          style={styles.input}
          value={formData.subject}
          onChangeText={(text) => updateFormData("subject", text)}
          placeholder="Enter subject"
        />
      </View>

      {/* Message Body */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Message *</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={formData.body}
          onChangeText={(text) => updateFormData("body", text)}
          placeholder="Enter your message"
          multiline
          numberOfLines={6}
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[styles.sendButton, sending && { opacity: 0.7 }]}
        onPress={handleSend}
        disabled={sending}
      >
        <Text style={styles.sendButtonText}>
          {sending ? "Sending..." : "Send Message"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    marginBottom: 24,
  },
  inputContainer: { marginBottom: 20 },
  label: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8fafc",
    fontFamily: "Montserrat-Regular",
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
})
