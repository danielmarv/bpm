"use client";

import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, RefreshControl } from "react-native";
import { messagesApi, Message } from "../../services/messagesApi";
import { MessageCard } from "./MessageCard";
import { PrimaryButton } from "../ui/Button";
import { Send } from "../ui/Icons";

interface MessageListProps {
  onOpenThread: (threadId: string) => void;
  onCompose: () => void;
}

export function MessageList({ onOpenThread, onCompose }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const inboxMessages = await messagesApi.getMessages({ type: "inbox" });
      setMessages(inboxMessages.messages); // backend returns { messages, pagination }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      Alert.alert("Error", "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, []);

  const unreadCount = messages.filter((msg) => !msg.isRead).length;
  const threadsCount = messages.length; // can replace with unique sender/receiver logic if needed

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Send size={48} color="#94a3b8" />
        </View>
        <Text style={styles.emptyTitle}>No Messages Yet</Text>
        <Text style={styles.emptyDescription}>
          Start a conversation with your healthcare provider
        </Text>
        <PrimaryButton title="Send Message" onPress={onCompose} style={styles.emptyButton} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
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
          <Text style={styles.statNumber}>{threadsCount}</Text>
          <Text style={styles.statLabel}>Threads</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.quickComposeButton}
        onPress={onCompose}
        activeOpacity={0.8}
      >
        <Send size={20} color="#ffffff" />
        <Text style={styles.quickComposeText}>New Message</Text>
      </TouchableOpacity>

      <View style={styles.messagesList}>
        {messages.map((message) => {
          // Ensure sender name mapping is correct
          const senderName =
            typeof message.senderId === "string"
              ? "Unknown"
              : `${message.senderId?.profile?.firstName || ""} ${message.senderId?.profile?.lastName || ""}`.trim() || "Unknown";

          return (
            <MessageCard
              key={message._id}
              message={{
                id: message._id!,
                threadId: message._id!,
                subject: message.subject,
                preview: message.body,
                sender: { name: senderName, role: "provider" },
                timestamp: message.createdAt || new Date().toISOString(),
                priority: message.priority,
                isRead: message.isRead || false,
                hasReplies: false,
                replyCount: 0,
              }}
              onPress={() => onOpenThread(message._id!)}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, marginTop: 12, color: "#64748b" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b", marginBottom: 8, textAlign: "center" },
  emptyDescription: { fontSize: 16, color: "#64748b", textAlign: "center", lineHeight: 24, marginBottom: 32 },
  emptyButton: { minWidth: 200, backgroundColor: "#2563eb" },
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
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#64748b" },
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
  quickComposeText: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
  messagesList: { gap: 12 },
});
