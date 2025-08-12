"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MessageList } from "../../components/messages/MessageList"
import { ComposeMessage } from "../../components/messages/ComposeMessage"
import { MessageThread } from "../../components/messages/MessageThread"
import { Inbox, Send, Users } from "../../components/ui/Icons"

type ViewMode = "inbox" | "compose" | "thread"

export default function MessagesScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("inbox")
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)

  const handleOpenThread = (threadId: string) => {
    setSelectedThreadId(threadId)
    setViewMode("thread")
  }

  const handleBackToInbox = () => {
    setViewMode("inbox")
    setSelectedThreadId(null)
  }

  const renderContent = () => {
    switch (viewMode) {
      case "compose":
        return <ComposeMessage onMessageSent={handleBackToInbox} onCancel={handleBackToInbox} />
      case "thread":
        return <MessageThread threadId={selectedThreadId} onBack={handleBackToInbox} onReply={handleBackToInbox} />
      default:
        return <MessageList onOpenThread={handleOpenThread} onCompose={() => setViewMode("compose")} />
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2563eb", "#3b82f6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Secure communication with your care team</Text>
      </LinearGradient>

      {/* Tab Navigation - Only show for inbox view */}
      {viewMode === "inbox" && (
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Inbox size={20} color="#2563eb" />
            <Text style={[styles.tabText, styles.activeTabText]}>Inbox</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab} onPress={() => setViewMode("compose")}>
            <Send size={20} color="#64748b" />
            <Text style={styles.tabText}>Compose</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab}>
            <Users size={20} color="#64748b" />
            <Text style={styles.tabText}>Providers</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#ffffff",
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 24,
    marginTop: -12,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#dbeafe",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  activeTabText: {
    color: "#2563eb",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  bottomPadding: {
    height: 32,
  },
})
