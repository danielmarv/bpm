"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native"
import { ArrowLeft, Send, Clock, AlertCircle } from "../ui/Icons"
import { messagesApi, Message as ApiMessage } from "../../services/messagesApi"
import { useAuth } from "../../contexts/AuthContext"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: "patient" | "provider"
  content: string
  timestamp: string
  priority: "urgent" | "high" | "normal" | "low"
  isRead?: boolean
}

interface MessageThreadProps {
  threadId: string | null
  onBack: () => void
}

export function MessageThread({ threadId, onBack }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<ScrollView>(null)
  const { user } = useAuth() // current logged-in user

  useEffect(() => {
    if (threadId) {
      loadMessages()
    }
  }, [threadId])

  const loadMessages = async () => {
    if (!threadId) return
    try {
      setLoading(true)
      const messageData: ApiMessage = await messagesApi.getMessageById(threadId)

      // Map API message to frontend format
      const mappedMessages: Message[] = [
        {
          id: messageData._id!,
          senderId: messageData.senderId || "",
          senderName: messageData.senderId === user?._id ? "You" : "Provider",
          senderRole: messageData.senderId === user?._id ? "patient" : "provider",
          content: messageData.body,
          timestamp: messageData.createdAt || new Date().toISOString(),
          priority: messageData.priority || "normal",
          isRead: messageData.isRead,
        },
      ]

      setMessages(mappedMessages)
    } catch (error) {
      console.error("Failed to load thread messages:", error)
      Alert.alert("Error", "Failed to load messages")
    } finally {
      setLoading(false)
      scrollRef.current?.scrollToEnd({ animated: true })
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !threadId) return

    try {
      // Assuming the receiver is the opposite user in the thread
      const receiverId =
        messages.find((m) => m.senderId !== user?._id)?.senderId || ""

      const newMsg = await messagesApi.sendMessage({
        receiverId,
        subject: "Re: Thread", // optional, adapt if threads have subjects
        body: replyText.trim(),
        priority: "normal",
      })

      const mappedMessage: Message = {
        id: newMsg._id!,
        senderId: user?._id!,
        senderName: "You",
        senderRole: "patient",
        content: newMsg.body,
        timestamp: newMsg.createdAt!,
        priority: newMsg.priority,
        isRead: true,
      }

      setMessages((prev) => [...prev, mappedMessage])
      setReplyText("")
      scrollRef.current?.scrollToEnd({ animated: true })
    } catch (error) {
      console.error("Failed to send reply:", error)
      Alert.alert("Error", "Failed to send reply")
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    )
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
        <Text style={styles.headerTitle}>Conversation</Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageCard,
              message.senderRole === "patient"
                ? styles.patientMessage
                : styles.providerMessage,
            ]}
          >
            {/* Message Header */}
            <View style={styles.messageHeader}>
              <View style={styles.senderInfo}>
                <Text style={styles.senderName}>{message.senderName}</Text>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(message.priority) },
                  ]}
                >
                  {message.priority === "urgent" && (
                    <AlertCircle size={12} color="#ffffff" />
                  )}
                  <Text style={styles.priorityText}>{message.priority}</Text>
                </View>
              </View>
              <View style={styles.timestampContainer}>
                <Clock size={14} color="#64748b" />
                <Text style={styles.timestamp}>
                  {formatTimestamp(message.timestamp)}
                </Text>
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
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginBottom: 16,
  },
  backButton: { padding: 8, marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1e293b" },
  messagesContainer: { flex: 1 },
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
  patientMessage: { marginLeft: 32, borderLeftWidth: 3, borderLeftColor: "#10b981" },
  providerMessage: { marginRight: 32, borderLeftWidth: 3, borderLeftColor: "#2563eb" },
  messageHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  senderInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  senderName: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  priorityBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 2 },
  priorityText: { fontSize: 10, color: "#ffffff", textTransform: "uppercase" },
  timestampContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  timestamp: { fontSize: 12, color: "#64748b" },
  messageContent: { fontSize: 14, color: "#374151", lineHeight: 20 },
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
    maxHeight: 100,
    textAlignVertical: "top",
  },
  sendButton: { backgroundColor: "#2563eb", borderRadius: 8, padding: 12, alignItems: "center", justifyContent: "center" },
  sendButtonDisabled: { backgroundColor: "#e2e8f0" },
})
