"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { Pill, MessageCircle, Activity, Calendar } from "../ui/Icons"

interface QuickAction {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  route: string
  color: string
}

export function QuickActions() {
  const router = useRouter()

  const actions: QuickAction[] = [
    {
      id: "medications",
      title: "Medications",
      subtitle: "Log dose",
      icon: <Pill size={24} color="#ffffff" />,
      route: "/medications",
      color: "#8b5cf6",
    },
    {
      id: "messages",
      title: "Messages",
      subtitle: "Contact provider",
      icon: <MessageCircle size={24} color="#ffffff" />,
      route: "/messages",
      color: "#3b82f6",
    },
    {
      id: "lifestyle",
      title: "Lifestyle",
      subtitle: "Track activity",
      icon: <Activity size={24} color="#ffffff" />,
      route: "/profile",
      color: "#10b981",
    },
    {
      id: "schedule",
      title: "Schedule",
      subtitle: "View appointments",
      icon: <Calendar size={24} color="#ffffff" />,
      route: "/tracking",
      color: "#f59e0b",
    },
  ]

  const handleActionPress = (route: string) => {
    router.push(route as any)
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, { backgroundColor: action.color }]}
            onPress={() => handleActionPress(action.route)}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>{action.icon}</View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  iconContainer: {
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#ffffff",
    opacity: 0.9,
    textAlign: "center",
  },
})
