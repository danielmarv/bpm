"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { ArrowLeft, Send, Clock, AlertCircle } from "../ui/Icons"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: "patient" | "provider"
  content: string
  timestamp: string
  priority: "urgent" | "high" | "normal" | "low"
}

interface MessageThreadProps {
  threadId: string | null
  onBack: () => void
  onReply: () => void
}

export function MessageThread({ threadId, onBack, onReply }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (threadId) {
      loadMessages()
    }
  }, [threadId])

  const loadMessages = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockMessages: Message[] = [
        {
          id: "1",
          senderId: "provider1",
          senderName: "Dr. Sarah Johnson",
          senderRole: "provider",
          content:
            "Hello! I've reviewed your recent blood pressure readings. Overall, they look good, but I noticed a few elevated readings last week. How have you been feeling?",
          timestamp: "2024-01-15T09:00:00Z",
          priority: "normal",
        },
        {
          id: "2",
          senderId: "patient1",
          senderName: "You",
          senderRole: "patient",
          content:
            "Hi Dr. Johnson, I've been feeling mostly fine. I did have a stressful week at work which might explain the higher readings. I've been taking my medication as prescribed.",
          timestamp: "2024-01-15T14:30:00Z",
          priority: "normal",
        },
        {
          id: "3",
          senderId: "provider1",
          senderName: "Dr. Sarah Johnson",
          senderRole: "provider",
          content:
            "That makes sense. Stress can definitely impact blood pressure. Let's continue monitoring. Please make sure to take readings at the same time each day if possible.",
          timestamp: "2024-01-15T16:45:00Z",
          priority: "normal",
        },
      ]
      setMessages(mockMessages)
    } catch (error) {
      Alert.alert("Error", "Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) return

    try {
      // Mock sending reply - replace with actual API call
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: "patient1",
        senderName: "You",
        senderRole: "patient",
        content: replyText.trim(),
        timestamp: new Date().toISOString(),
        priority: "normal",
      }

      setMessages((prev) => [...prev, newMessage])
      setReplyText("")
      Alert.alert("Success", "Reply sent successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to send reply")
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "#dc2626"
      case "high":
        return "#ea580c"
      case "normal":
        return "#2563eb"
      case "low":
        return "#64748b"
      default:
        return "#2563eb"
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#2563eb" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Conversation</Text>
          <Text style={styles.headerSubtitle}>{messages.length} messages</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageCard,
              message.senderRole === "patient" ? styles.patientMessage : styles.providerMessage,
            ]}
          >
            {/* Message Header */}
            <View style={styles.messageHeader}>
              <View style={styles.senderInfo}>
                <Text style={styles.senderName}>{message.senderName}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(message.priority) }]}>
                  {message.priority === "urgent" && <AlertCircle size={12} color="#ffffff" />}
                  <Text style={styles.priorityText}>{message.priority}</Text>
                </View>
              </View>
              <View style={styles.timestampContainer}>
                <Clock size={14} color="#64748b" />
                <Text style={styles.timestamp}>{formatTimestamp(message.timestamp)}</Text>
              </View>
            </View>

            {/* Message Content */}
            <Text style={styles.messageContent}>{message.content}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Reply Input */}
      <View style={styles.replyContainer}>
        <TextInput
          style={styles.replyInput}
          placeholder="Type your reply..."
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendReply}
          disabled={!replyText.trim()}
        >
          <Send size={20} color={!replyText.trim() ? "#94a3b8" : "#ffffff"} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  messagesContainer: {
    flex: 1,
    paddingBottom: 16,
  },
  messageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  patientMessage: {
    marginLeft: 32,
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
  },
  providerMessage: {
    marginRight: 32,
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  senderName: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: "OpenSans-SemiBold",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  messageContent: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#374151",
    lineHeight: 20,
  },
  replyContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    gap: 12,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#374151",
    maxHeight: 100,
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#e2e8f0",
  },
})
