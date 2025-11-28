"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { TemplateCard } from "./TemplateCard"
import { CreateTemplateForm } from "./CreateTemplateForm"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { PrimaryButton } from "../ui/Button"
import { Plus, Edit3, Trash2 } from "../ui/Icons"
import { medicationTemplatesApi, MedicationTemplate } from "../../services/medicationTemplatesApi"

interface TemplateManagementProps {
  onBack: () => void
}

type ViewMode = "list" | "create" | "edit"

export function TemplateManagement({ onBack }: TemplateManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [templates, setTemplates] = useState<MedicationTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<MedicationTemplate | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await medicationTemplatesApi.getProviderTemplates({ isActive: true })
      setTemplates(data.templates)
    } catch (error) {
      console.error("Failed to load templates:", error)
      Alert.alert("Error", "Failed to load your templates")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = (template: MedicationTemplate) => {
    Alert.alert(
      "Delete Template",
      `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await medicationTemplatesApi.deleteTemplate(template._id)
              Alert.alert("Success", "Template deleted successfully")
              loadTemplates()
            } catch (error) {
              console.error("Failed to delete template:", error)
              Alert.alert("Error", "Failed to delete template")
            }
          },
        },
      ]
    )
  }

  const handleTemplateCreated = () => {
    setViewMode("list")
    loadTemplates()
  }

  if (viewMode === "create") {
    return (
      <CreateTemplateForm
        onTemplateCreated={handleTemplateCreated}
        onCancel={() => setViewMode("list")}
      />
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Templates</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{templates.length}</Text>
          <Text style={styles.statLabel}>Total Templates</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {templates.filter(t => t.isPublic).length}
          </Text>
          <Text style={styles.statLabel}>Public Templates</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {templates.reduce((sum, t) => sum + t.usageCount, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Uses</Text>
        </View>
      </View>

      {/* Create Button */}
      <View style={styles.createSection}>
        <PrimaryButton
          title="Create New Template"
          onPress={() => setViewMode("create")}
          style={styles.createButton}
          icon={<Plus size={20} color="#ffffff" />}
        />
      </View>

      {/* Templates List */}
      <ScrollView style={styles.templatesList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
            <Text style={styles.loadingText}>Loading your templates...</Text>
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Templates Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first medication template to help prescribe medications more efficiently
            </Text>
            <TouchableOpacity
              style={styles.emptyCreateButton}
              onPress={() => setViewMode("create")}
            >
              <Plus size={24} color="#7c3aed" />
              <Text style={styles.emptyCreateText}>Create Your First Template</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {templates.map((template) => (
              <View key={template._id} style={styles.templateContainer}>
                <TemplateCard
                  template={template}
                  onSelect={() => {}}
                  showProvider={false}
                />
                <View style={styles.templateActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => {
                      setEditingTemplate(template)
                      setViewMode("edit")
                    }}
                  >
                    <Edit3 size={16} color="#3b82f6" />
                    <Text style={[styles.actionButtonText, styles.editButtonText]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteTemplate(template)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Template Status */}
                <View style={styles.templateStatus}>
                  {template.isPublic && (
                    <View style={[
                      styles.statusBadge,
                      template.approvalStatus === "approved" && styles.approvedBadge,
                      template.approvalStatus === "pending" && styles.pendingBadge,
                      template.approvalStatus === "rejected" && styles.rejectedBadge,
                    ]}>
                      <Text style={[
                        styles.statusText,
                        template.approvalStatus === "approved" && styles.approvedText,
                        template.approvalStatus === "pending" && styles.pendingText,
                        template.approvalStatus === "rejected" && styles.rejectedText,
                      ]}>
                        Public - {template.approvalStatus}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    paddingVertical: 4,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: "OpenSans-SemiBold",
    color: "#7c3aed",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#7c3aed",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    textAlign: "center",
  },
  createSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  createButton: {
    backgroundColor: "#7c3aed",
  },
  templatesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyCreateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#7c3aed",
    borderStyle: "dashed",
  },
  emptyCreateText: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#7c3aed",
    marginLeft: 8,
  },
  templateContainer: {
    marginBottom: 16,
  },
  templateActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButton: {
    borderColor: "#3b82f6",
    backgroundColor: "#dbeafe",
  },
  deleteButton: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    marginLeft: 4,
  },
  editButtonText: {
    color: "#3b82f6",
  },
  deleteButtonText: {
    color: "#ef4444",
  },
  templateStatus: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: "#dcfce7",
  },
  pendingBadge: {
    backgroundColor: "#fef3c7",
  },
  rejectedBadge: {
    backgroundColor: "#fef2f2",
  },
  statusText: {
    fontSize: 10,
    fontFamily: "OpenSans-SemiBold",
  },
  approvedText: {
    color: "#16a34a",
  },
  pendingText: {
    color: "#d97706",
  },
  rejectedText: {
    color: "#dc2626",
  },
})