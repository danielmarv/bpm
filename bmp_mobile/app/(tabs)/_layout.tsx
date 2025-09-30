"use client"

import { Tabs } from "expo-router"
import { Platform, Dimensions } from "react-native"
import { useAuth } from "../../contexts/AuthContext"
import {
  Heart,
  Activity,
  Pill,
  MessageSquare,
  User,
  Shield,
  BookOpen,
} from "../../components/ui/Icons"
import AnimatedTabIcon from "../../components/AnimatedTabIcon"

const { width: screenWidth } = Dimensions.get("window")
const TAB_HEIGHT = Platform.OS === "ios" ? 70 : 60

// responsive font size
const fontSize = screenWidth < 360 ? 10 : 12

export default function TabLayout() {
  const { isAdmin } = useAuth()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: Platform.OS === "ios" ? 0.5 : 1,
          borderTopColor: "#e2e8f0",
          height: TAB_HEIGHT,
          paddingBottom: Platform.OS === "ios" ? 8 : 4,
          paddingTop: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 4,
        },
        tabBarLabelStyle: {
          fontSize,
          fontFamily: "OpenSans-SemiBold",
        },
        tabBarIconStyle: {
          marginBottom: -2, // keeps icons closer to labels
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: (props) => <AnimatedTabIcon {...props} Icon={Heart} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: "BP Tracking",
          tabBarIcon: (props) => <AnimatedTabIcon {...props} Icon={Activity} />,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: "Medications",
          tabBarIcon: (props) => <AnimatedTabIcon {...props} Icon={Pill} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: (props) => <AnimatedTabIcon {...props} Icon={MessageSquare} />,
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: "Education",
          tabBarIcon: (props) => <AnimatedTabIcon {...props} Icon={BookOpen} />,
        }}
      />
      {isAdmin() && (
        <Tabs.Screen
          name="admin"
          options={{
            title: "Admin",
            tabBarIcon: (props) => <AnimatedTabIcon {...props} Icon={Shield} />,
            tabBarActiveTintColor: "#dc2626",
            tabBarLabelStyle: {
              fontSize,
              fontFamily: "OpenSans-SemiBold",
              color: "#dc2626",
            },
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: (props) => <AnimatedTabIcon {...props} Icon={User} />,
        }}
      />
    </Tabs>
  )
}
