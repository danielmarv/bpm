"use client"

import { Tabs } from "expo-router"
import { Platform, Dimensions, ViewStyle } from "react-native"
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from "react-native-reanimated"
import { 
  Heart, 
  Activity, 
  Pill, 
  MessageSquare, 
  User,
  BookOpen // <-- Add icon for Education
} from "../../components/ui/Icons"

const { height: screenHeight } = Dimensions.get("window")
const TAB_HEIGHT = Platform.OS === "ios" ? 90 : 80

export default function TabLayout() {
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

      {/* New Education Tab */}
      <Tabs.Screen
        name="education"
        options={{
          title: "Education",
          tabBarIcon: (props) => <AnimatedTabIcon {...props} Icon={BookOpen} />,
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
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: (props) => <AnimatedTabIcon {...props} Icon={User} />,
        }}
      />
    </Tabs>
  )
}

// Animated Icon Component
type TabIconProps = {
  focused: boolean
  color: string
  size: number
  Icon: (props: { color: string; size: number }) => JSX.Element
}

function AnimatedTabIcon({ focused, color, size, Icon }: TabIconProps) {
  const scale = useSharedValue(focused ? 1.3 : 1)
  const rotateX = useSharedValue(focused ? "15deg" : "0deg")

  // Animate values
  scale.value = withTiming(focused ? 1.3 : 1)
  rotateX.value = withTiming(focused ? "15deg" : "0deg")

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value, rotateX: rotateX.value }],
      shadowOpacity: withTiming(focused ? 0.25 : 0),
      shadowRadius: withTiming(focused ? 6 : 0),
      elevation: withTiming(focused ? 8 : 0),
    } as ViewStyle
  })

  return (
    <Animated.View style={animatedStyle}>
      <Icon color={color} size={size + 2} />
    </Animated.View>
  )
}
