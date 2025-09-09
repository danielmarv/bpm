"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from "react-native"
import { adminApi, type SystemSettings as SystemSettingsType } from "../../services/adminApi"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { Settings, Save, AlertTriangle } from "../ui/Icons"

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettingsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await adminApi.getSystemSettings()
      setSettings(data)
    } catch (error) {
      Alert.alert("Error", "Failed to load system settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      await adminApi.updateSystemSettings(settings)
      Alert.alert("Success", "System settings updated successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to update system settings")
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof SystemSettingsType, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    )
  }

  if (!settings) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load settings</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Settings size={24} color="#dc2626" />
        <Text style={styles.title}>System Settings</Text>
      </View>

      {/* General Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Maintenance Mode</Text>
            <Text style={styles.settingDescription}>Temporarily disable user access for maintenance</Text>
          </View>
          <Switch
            value={settings.maintenanceMode}
            onValueChange={(value) => updateSetting("maintenanceMode", value)}
            trackColor={{ false: "#e2e8f0", true: "#dc2626" }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Registration Enabled</Text>
            <Text style={styles.settingDescription}>Allow new users to register accounts</Text>
          </View>
          <Switch
            value={settings.registrationEnabled}
            onValueChange={(value) => updateSetting("registrationEnabled", value)}
            trackColor={{ false: "#e2e8f0", true: "#dc2626" }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Text style={styles.settingDescription}>Send system notifications via email</Text>
          </View>
          <Switch
            value={settings.emailNotifications}
            onValueChange={(value) => updateSetting("emailNotifications", value)}
            trackColor={{ false: "#e2e8f0", true: "#dc2626" }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>SMS Notifications</Text>
            <Text style={styles.settingDescription}>Send critical alerts via SMS</Text>
          </View>
          <Switch
            value={settings.smsNotifications}
            onValueChange={(value) => updateSetting("smsNotifications", value)}
            trackColor={{ false: "#e2e8f0", true: "#dc2626" }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Data Retention</Text>
            <Text style={styles.settingDescription}>{settings.dataRetentionDays} days</Text>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Backup Frequency</Text>
            <Text style={styles.settingDescription}>{settings.backupFrequency}</Text>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Max Patients per Provider</Text>
            <Text style={styles.settingDescription}>{settings.maxUsersPerProvider} patients</Text>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? <LoadingSpinner size="small" color="#ffffff" /> : <Save size={20} color="#ffffff" />}
        <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Settings"}</Text>
      </TouchableOpacity>
    </ScrollView>
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
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#1e293b",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 32,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "OpenSans-SemiBold",
    color: "#ffffff",
  },
})
