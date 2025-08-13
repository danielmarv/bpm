"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useAuth } from "../contexts/AuthContext"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import { PrimaryButton, SecondaryButton } from "../components/ui/Button"
import { Heart, Activity, Shield, User } from "../components/ui/Icons"

const { width, height } = Dimensions.get("window")

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace("/(tabs)/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <LinearGradient colors={["#f8fafc", "#e2e8f0"]} style={styles.loadingContainer}>
        <LoadingSpinner size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading BP Manager...</Text>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#f8fafc", "#e2e8f0"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Heart size={48} color="#ffffff" />
          </View>

          <Text style={styles.title}>
            Take Control of Your{"\n"}
            <Text style={styles.titleAccent}>Blood Pressure</Text>
          </Text>

          <Text style={styles.subtitle}>
            Professional blood pressure management with stunning 3D visualizations, medication tracking, and secure
            provider communication.
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <View style={[styles.featureCard, { backgroundColor: "#ecfdf5" }]}>
              <View style={[styles.featureIcon, { backgroundColor: "#059669" }]}>
                <Activity size={24} color="#ffffff" />
              </View>
              <Text style={styles.featureTitle}>3D Visualizations</Text>
              <Text style={styles.featureDescription}>Interactive charts and immersive health data</Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: "#eff6ff" }]}>
              <View style={[styles.featureIcon, { backgroundColor: "#2563eb" }]}>
                <Shield size={24} color="#ffffff" />
              </View>
              <Text style={styles.featureTitle}>Secure & Private</Text>
              <Text style={styles.featureDescription}>HIPAA-compliant data protection</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={[styles.featureCard, { backgroundColor: "#fef3e2" }]}>
              <View style={[styles.featureIcon, { backgroundColor: "#d97706" }]}>
                <User size={24} color="#ffffff" />
              </View>
              <Text style={styles.featureTitle}>Provider Connect</Text>
              <Text style={styles.featureDescription}>Seamless healthcare communication</Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: "#f3e8ff" }]}>
              <View style={[styles.featureIcon, { backgroundColor: "#7c3aed" }]}>
                <Heart size={24} color="#ffffff" />
              </View>
              <Text style={styles.featureTitle}>Smart Tracking</Text>
              <Text style={styles.featureDescription}>Intelligent health monitoring</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <PrimaryButton
            title="Get Started Free"
            onPress={() => router.push("/auth/register")}
            style={styles.primaryButton}
          />
          <SecondaryButton title="Sign In" onPress={() => router.push("/auth/login")} style={styles.secondaryButton} />
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "400",
    color: "#475569",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 16,
  },
  titleAccent: {
    color: "#059669",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  featureCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000",
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    fontWeight: "400",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 16,
  },
  actionContainer: {
    gap: 12,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    marginTop: 8,
  },
})
