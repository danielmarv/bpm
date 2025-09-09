"use client"

import { type ReactNode, useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../../contexts/AuthContext"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { Shield, AlertTriangle } from "../ui/Icons"

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  allowedRoles?: Array<"patient" | "provider" | "admin">
  redirectTo?: string
  fallback?: ReactNode
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles,
  redirectTo = "/auth/login",
  fallback,
}: ProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Redirect if authentication is required but user is not logged in
      if (requireAuth && !user) {
        router.replace(redirectTo)
        return
      }

      // Redirect if user doesn't have required role
      if (user && allowedRoles && !allowedRoles.some((role) => hasRole(role))) {
        // Redirect based on user role
        if (user.role === "admin") {
          router.replace("/(tabs)/admin")
        } else {
          router.replace("/(tabs)/dashboard")
        }
        return
      }
    }
  }, [user, loading, requireAuth, allowedRoles, redirectTo, router, hasRole])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" color="#059669" />
        <Text style={styles.loadingText}>Verifying access...</Text>
      </View>
    )
  }

  // Show fallback if authentication required but user not logged in
  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>
    }
    return (
      <View style={styles.fallbackContainer}>
        <Shield size={48} color="#ef4444" />
        <Text style={styles.fallbackTitle}>Authentication Required</Text>
        <Text style={styles.fallbackText}>Please log in to access this page</Text>
      </View>
    )
  }

  // Show fallback if user doesn't have required role
  if (user && allowedRoles && !allowedRoles.some((role) => hasRole(role))) {
    if (fallback) {
      return <>{fallback}</>
    }
    return (
      <View style={styles.fallbackContainer}>
        <AlertTriangle size={48} color="#f59e0b" />
        <Text style={styles.fallbackTitle}>Access Restricted</Text>
        <Text style={styles.fallbackText}>You don't have permission to access this page</Text>
        <Text style={styles.roleText}>
          Required: {allowedRoles.join(", ")} | Your role: {user.role}
        </Text>
      </View>
    )
  }

  return <>{children}</>
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  fallbackTitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  fallbackText: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
  },
  roleText: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#94a3b8",
    textAlign: "center",
  },
})
