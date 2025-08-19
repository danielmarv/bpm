import { Tabs } from "expo-router"
import { Heart, Activity, Pill, MessageSquare, User } from "../../components/ui/Icons"
import { Platform, Dimensions } from "react-native"

const { height: screenHeight } = Dimensions.get("window")

export default function TabLayout() {
  const tabBarHeight = Platform.OS === "ios" ? 90 : 80

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
          height: tabBarHeight,
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
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Heart size={size + 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: "BP Tracking",
          tabBarIcon: ({ color, size }) => <Activity size={size + 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: "Medications",
          tabBarIcon: ({ color, size }) => <Pill size={size + 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => <MessageSquare size={size + 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size + 2} color={color} />,
        }}
      />
    </Tabs>
  )
}
