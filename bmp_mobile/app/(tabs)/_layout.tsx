"use client"

import { Tabs } from "expo-router"
import { Platform, Dimensions } from "react-native"
import { useAuth } from "../../contexts/AuthContext"
import { Heart, Activity, Pill, MessageSquare, User, Shield, BookOpen } from "../../components/ui/Icons"
import AnimatedTabIcon from "../../components/AnimatedTabIcon"

const { height: screenHeight } = Dimensions.get("window")
const TAB_HEIGHT = Platform.OS === "ios" ? 90 : 80

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
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
          height: TAB_HEIGHT,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "OpenSans-SemiBold",
          marginTop: 4,
        },
        tabBarItemStyle: { paddingVertical: 4 },
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
