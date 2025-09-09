"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native"
import { useAuth } from "../../contexts/AuthContext"
import { usersApi, type UserProfile, type BPThresholds } from "../../services/usersApi"
import { PrimaryButton, SecondaryButton } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { ArrowLeft, User, Phone, Calendar, Lock, Trash2 } from "../ui/Icons"

interface ProfileSettingsProps {
  onBack: () => void
}

export function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const { user, logout, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "health" | "security" | "danger">("profile")

  // Profile form
  const [profileForm, setProfileForm] = useState<UserProfile>({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    phone: user?.profile?.phone || "",
    dateOfBirth: user?.profile?.dateOfBirth || "",
  })

  // Health thresholds form
  const [thresholdsForm, setThresholdsForm] = useState<BPThresholds>({
    systolicHigh: user?.bpThresholds?.systolicHigh || 140,
    systolicLow: user?.bpThresholds?.systolicLow || 90,
    diastolicHigh: user?.bpThresholds?.diastolicHigh || 90,
    diastolicLow: user?.bpThresholds?.diastolicLow || 60,
  })

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
      const updatedUser = await usersApi.updateProfile(profileForm)
      updateUser(updatedUser)
      Alert.alert("Success", "Profile updated successfully")
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateThresholds = async () => {
    try {
      setLoading(true)
      const updatedUser = await usersApi.updateBPThresholds(thresholdsForm)
      updateUser(updatedUser)
      Alert.alert("Success", "Health thresholds updated successfully")
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to update thresholds")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Error", "New passwords do not match")
      return
    }
    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }

    try {
      setLoading(true)
      await usersApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      Alert.alert("Success", "Password changed successfully")
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "Are you sure you want to delete your account? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true)
            await usersApi.deleteAccount()
            logout()
          } catch (error) {
            Alert.alert("Error", error instanceof Error ? error.message : "Failed to delete account")
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ])
  }

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>First Name</Text>
        <View style={styles.inputWrapper}>
          <User size={20} color="#64748b" />
          <TextInput
            style={styles.input}
            value={profileForm.firstName}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, firstName: value }))}
            placeholder="Enter first name"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Last Name</Text>
        <View style={styles.inputWrapper}>
          <User size={20} color="#64748b" />
          <TextInput
            style={styles.input}
            value={profileForm.lastName}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, lastName: value }))}
            placeholder="Enter last name"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone</Text>
        <View style={styles.inputWrapper}>
          <Phone size={20} color="#64748b" />
          <TextInput
            style={styles.input}
            value={profileForm.phone}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, phone: value }))}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date of Birth</Text>
        <View style={styles.inputWrapper}>
          <Calendar size={20} color="#64748b" />
          <TextInput
            style={styles.input}
            value={profileForm.dateOfBirth}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, dateOfBirth: value }))}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <PrimaryButton
        title="Update Profile"
        onPress={handleUpdateProfile}
        disabled={loading}
        style={styles.updateButton}
      />
    </View>
  )

  const renderHealthTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Blood Pressure Thresholds</Text>
      <Text style={styles.sectionDescription}>
        Set your personal blood pressure thresholds for monitoring and alerts.
      </Text>

      <View style={styles.thresholdRow}>
        <View style={styles.thresholdInput}>
          <Text style={styles.label}>Systolic High</Text>
          <TextInput
            style={styles.textInput}
            value={thresholdsForm.systolicHigh?.toString()}
            onChangeText={(value) => setThresholdsForm((prev) => ({ ...prev, systolicHigh: Number(value) }))}
            keyboardType="numeric"
            placeholder="140"
          />
        </View>
        <View style={styles.thresholdInput}>
          <Text style={styles.label}>Systolic Low</Text>
          <TextInput
            style={styles.textInput}
            value={thresholdsForm.systolicLow?.toString()}
            onChangeText={(value) => setThresholdsForm((prev) => ({ ...prev, systolicLow: Number(value) }))}
            keyboardType="numeric"
            placeholder="90"
          />
        </View>
      </View>

      <View style={styles.thresholdRow}>
        <View style={styles.thresholdInput}>
          <Text style={styles.label}>Diastolic High</Text>
          <TextInput
            style={styles.textInput}
            value={thresholdsForm.diastolicHigh?.toString()}
            onChangeText={(value) => setThresholdsForm((prev) => ({ ...prev, diastolicHigh: Number(value) }))}
            keyboardType="numeric"
            placeholder="90"
          />
        </View>
        <View style={styles.thresholdInput}>
          <Text style={styles.label}>Diastolic Low</Text>
          <TextInput
            style={styles.textInput}
            value={thresholdsForm.diastolicLow?.toString()}
            onChangeText={(value) => setThresholdsForm((prev) => ({ ...prev, diastolicLow: Number(value) }))}
            keyboardType="numeric"
            placeholder="60"
          />
        </View>
      </View>

      <PrimaryButton
        title="Update Thresholds"
        onPress={handleUpdateThresholds}
        disabled={loading}
        style={styles.updateButton}
      />
    </View>
  )

  const renderSecurityTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Change Password</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputWrapper}>
          <Lock size={20} color="#64748b" />
          <TextInput
            style={styles.input}
            value={passwordForm.currentPassword}
            onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, currentPassword: value }))}
            placeholder="Enter current password"
            secureTextEntry
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <Lock size={20} color="#64748b" />
          <TextInput
            style={styles.input}
            value={passwordForm.newPassword}
            onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))}
            placeholder="Enter new password"
            secureTextEntry
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputWrapper}>
          <Lock size={20} color="#64748b" />
          <TextInput
            style={styles.input}
            value={passwordForm.confirmPassword}
            onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, confirmPassword: value }))}
            placeholder="Confirm new password"
            secureTextEntry
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <PrimaryButton
        title="Change Password"
        onPress={handleChangePassword}
        disabled={loading}
        style={styles.updateButton}
      />
    </View>
  )

  const renderDangerTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.dangerSection}>
        <Text style={styles.sectionTitle}>Logout</Text>
        <Text style={styles.sectionDescription}>Sign out of your account on this device.</Text>
        <SecondaryButton title="Logout" onPress={handleLogout} style={styles.logoutButton} />
      </View>

      <View style={styles.dangerSection}>
        <Text style={[styles.sectionTitle, styles.dangerTitle]}>Delete Account</Text>
        <Text style={styles.sectionDescription}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Trash2 size={20} color="#ffffff" />
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "profile" && styles.activeTabButton]}
          onPress={() => setActiveTab("profile")}
        >
          <Text style={[styles.tabButtonText, activeTab === "profile" && styles.activeTabButtonText]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "health" && styles.activeTabButton]}
          onPress={() => setActiveTab("health")}
        >
          <Text style={[styles.tabButtonText, activeTab === "health" && styles.activeTabButtonText]}>Health</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "security" && styles.activeTabButton]}
          onPress={() => setActiveTab("security")}
        >
          <Text style={[styles.tabButtonText, activeTab === "security" && styles.activeTabButtonText]}>Security</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "danger" && styles.activeTabButton]}
          onPress={() => setActiveTab("danger")}
        >
          <Text style={[styles.tabButtonText, activeTab === "danger" && styles.activeTabButtonText]}>Account</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <LoadingSpinner size="large" color="#059669" />
          </View>
        )}

        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "health" && renderHealthTab()}
        {activeTab === "security" && renderSecurityTab()}
        {activeTab === "danger" && renderDangerTab()}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 20, fontFamily: "Montserrat-Bold", color: "#1e293b" },
  placeholder: { width: 40 },
  tabNavigation: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tabButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, alignItems: "center" },
  activeTabButton: { backgroundColor: "#059669" },
  tabButtonText: { fontSize: 14, fontFamily: "OpenSans-SemiBold", color: "#64748b" },
  activeTabButtonText: { color: "#ffffff" },
  content: { flex: 1 },
  tabContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: "Montserrat-SemiBold", color: "#1e293b", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#1e293b",
    paddingVertical: 12,
    paddingLeft: 12,
  },
  textInput: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: { fontSize: 18, fontFamily: "Montserrat-Bold", color: "#1e293b", marginBottom: 8 },
  sectionDescription: { fontSize: 14, fontFamily: "OpenSans-Regular", color: "#64748b", marginBottom: 24 },
  thresholdRow: { flexDirection: "row", gap: 16, marginBottom: 20 },
  thresholdInput: { flex: 1 },
  updateButton: { backgroundColor: "#059669", marginTop: 8 },
  dangerSection: { marginBottom: 32 },
  dangerTitle: { color: "#dc2626" },
  logoutButton: { backgroundColor: "#64748b" },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: { fontSize: 16, fontFamily: "OpenSans-SemiBold", color: "#ffffff" },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
})
