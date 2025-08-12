import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Clock, MessageCircle, AlertCircle } from "../ui/Icons"

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

interface MessageCardProps {
  message: Message
  onPress: () => void
}

export function MessageCard({ message, onPress }: MessageCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "#dc2626"
      case "high":
        return "#ea580c"
      case "normal":
        return "#059669"
      default:
        return "#64748b"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "URGENT"
      case "high":
        return "HIGH"
      case "normal":
        return "NORMAL"
      default:
        return "LOW"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  return (
    <TouchableOpacity
      style={[styles.container, !message.isRead && styles.unreadContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.senderInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{message.sender.name.charAt(0)}</Text>
          </View>
          <View style={styles.senderDetails}>
            <Text style={[styles.senderName, !message.isRead && styles.unreadText]}>{message.sender.name}</Text>
            <Text style={styles.senderRole}>
              {message.sender.role === "provider" ? "Healthcare Provider" : "Patient"}
            </Text>
          </View>
        </View>
        <View style={styles.metadata}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(message.priority) }]}>
            {message.priority === "urgent" && <AlertCircle size={12} color="#ffffff" />}
            <Text style={styles.priorityText}>{getPriorityLabel(message.priority)}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#94a3b8" />
            <Text style={styles.timestamp}>{formatTimestamp(message.timestamp)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.subject, !message.isRead && styles.unreadText]}>{message.subject}</Text>
        <Text style={styles.preview} numberOfLines={2}>
          {message.preview}
        </Text>
      </View>

      <View style={styles.footer}>
        {message.hasReplies && (
          <View style={styles.repliesContainer}>
            <MessageCircle size={16} color="#2563eb" />
            <Text style={styles.repliesText}>{message.replyCount} replies</Text>
          </View>
        )}
        {!message.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  unreadContainer: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#ffffff",
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 2,
  },
  unreadText: {
    color: "#2563eb",
  },
  senderRole: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  metadata: {
    alignItems: "flex-end",
    gap: 8,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: "OpenSans-SemiBold",
    color: "#ffffff",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#94a3b8",
  },
  content: {
    marginBottom: 12,
  },
  subject: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 8,
  },
  preview: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  repliesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  repliesText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#2563eb",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
  },
})
