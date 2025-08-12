"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { MessageCard } from "./MessageCard"
import { PrimaryButton } from "../ui/Button"
import { Send } from "../ui/Icons"

interface Message {
  id: string
  threadId: string
  subject: string
  preview: string
  sender: {
    name: string
    role: "patient" | "provider"
    avatar?: string
  }
  timestamp: string
  priority: "urgent" | "high" | "normal" | "low"
  isRead: boolean
  hasReplies: boolean
  replyCount: number
}

interface MessageListProps {
  onOpenThread: (threadId: string) => void
  onCompose: () => void
}

export function MessageList({ onOpenThread, onCompose }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setMessages([
        {
          id: "1",
          threadId: "thread-1",
          subject: "Blood Pressure Concerns",
          preview: "I've been experiencing higher readings lately and wanted to discuss...",
          sender: {
            name: "Dr. Sarah Johnson",
            role: "provider",
          },
          timestamp: "2024-01-15T10:30:00Z",
          priority: "high",
          isRead: false,
          hasReplies: true,
          replyCount: 3,
        },
        {
          id: "2",
          threadId: "thread-2",
          subject: "Medication Adjustment",
          preview: "Based on your recent readings, I'd like to adjust your Lisinopril dosage...",
          sender: {
            name: "Dr. Michael Chen",
            role: "provider",
          },
          timestamp: "2024-01-14T14:15:00Z",
          priority: "normal",
          isRead: true,
          hasReplies: false,
          replyCount: 0,
        },
        {
          id: "3",
          threadId: "thread-3",
          subject: "Lab Results Available",
          preview: "Your recent lab work is now available. Overall results look good...",
          sender: {
            name: "Dr. Sarah Johnson",
            role: "provider",
          },
          timestamp: "2024-01-13T09:45:00Z",
          priority: "normal",
          isRead: true,
          hasReplies: true,
          replyCount: 1,
        },
        {
          id: "4",
          threadId: "thread-4",
          subject: "Appointment Reminder",
          preview: "This is a reminder about your upcoming appointment on January 20th...",
          sender: {
            name: "Healthcare Team",
            role: "provider",
          },
          timestamp: "2024-01-12T16:00:00Z",
          priority: "low",
          isRead: true,
          hasReplies: false,
          replyCount: 0,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const unreadCount = messages.filter((msg) => !msg.isRead).length

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    )
  }

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Send size={48} color="#94a3b8" />
        </View>
        <Text style={styles.emptyTitle}>No Messages Yet</Text>
        <Text style={styles.emptyDescription}>Start a conversation with your healthcare provider</Text>
        <PrimaryButton title="Send Message" onPress={onCompose} style={styles.emptyButton} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{messages.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#2563eb" }]}>{unreadCount}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{messages.filter((msg) => msg.hasReplies).length}</Text>
          <Text style={styles.statLabel}>Threads</Text>
        </View>
      </View>

      {/* Quick Compose Button */}
      <TouchableOpacity style={styles.quickComposeButton} onPress={onCompose} activeOpacity={0.8}>
        <Send size={20} color="#ffffff" />
        <Text style={styles.quickComposeText}>New Message</Text>
      </TouchableOpacity>

      {/* Messages List */}
      <View style={styles.messagesList}>
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} onPress={() => onOpenThread(message.threadId)} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    minWidth: 200,
    backgroundColor: "#2563eb",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  quickComposeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 8,
  },
  quickComposeText: {
    fontSize: 16,
    fontFamily: "OpenSans-SemiBold",
    color: "#ffffff",
  },
  messagesList: {
    gap: 12,
  },
})
