"use client"

import { Stack } from "expo-router"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AuthProvider } from "../contexts/AuthContext"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
