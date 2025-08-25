import { useState } from "react"
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Picker } from "@react-native-picker/picker" // ✅ Added Picker
import { messagesApi } from "../../services/messagesApi"
import { ProviderSelector } from "../ProviderSelector"

export function ComposeMessage({ navigation }: any) {
  const [formData, setFormData] = useState({
    providerId: "",
    subject: "",
    body: "",
    priority: "normal", // ✅ keep in state, default normal
  })

  const [sending, setSending] = useState(false)

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
        priority: formData.priority, // ✅ now from picker
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

      {/* Provider Selection */}
      <View style={styles.inputContainer}>
        <ProviderSelector
          selectedProviderId={formData.providerId}
          onProviderChange={(providerId) => updateFormData("providerId", providerId)}
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

      {/* Priority Selector */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Priority *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.priority}
            onValueChange={(value) => updateFormData("priority", value)}
            style={styles.picker}
          >
            <Picker.Item label="Low" value="low" />
            <Picker.Item label="Normal" value="normal" />
            <Picker.Item label="High" value="high" />
            <Picker.Item label="Urgent" value="urgent" />
          </Picker>
        </View>
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[styles.sendButton, sending && { opacity: 0.7 }]}
        onPress={handleSend}
        disabled={sending}
      >
        <Text style={styles.sendButtonText}>{sending ? "Sending..." : "Send Message"}</Text>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  picker: {
    height: 50,
    width: "100%",
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
