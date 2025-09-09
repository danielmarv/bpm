"use client"

import type React from "react"
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from "react-native-reanimated"
import { useEffect } from "react"

interface AnimatedTabIconProps {
  focused: boolean
  color: string
  size?: number
  Icon: React.ComponentType<{ size?: number; color?: string }>
}

export default function AnimatedTabIcon({ focused, color, size = 24, Icon }: AnimatedTabIconProps) {
  const scale = useSharedValue(0)
  const opacity = useSharedValue(0.7)

  useEffect(() => {
    scale.value = withSpring(focused ? 1.2 : 1, {
      damping: 15,
      stiffness: 150,
    })

    opacity.value = withSpring(focused ? 1 : 0.7, {
      damping: 15,
      stiffness: 150,
    })
  }, [focused])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }
  })

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolate(scale.value, [1, 1.2], [0, 0.1])

    return {
      backgroundColor: `rgba(5, 150, 105, ${backgroundColor})`,
      borderRadius: 12,
      padding: focused ? 8 : 4,
    }
  })

  return (
    <Animated.View style={backgroundStyle}>
      <Animated.View style={animatedStyle}>
        <Icon size={size} color={color} />
      </Animated.View>
    </Animated.View>
  )
}
