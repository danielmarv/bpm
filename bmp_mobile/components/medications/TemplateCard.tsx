"use client"

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { MedicationTemplate } from "../../services/medicationTemplatesApi"
import { Pill, Heart, Activity, TrendingUp, Target, Zap, Shield, Plus, MoreVertical } from "../ui/Icons"

interface TemplateCardProps {
  template: MedicationTemplate
  onSelect: (template: MedicationTemplate) => void
  showProvider?: boolean
}

const getCategoryIcon = (category: string) => {
  const iconSize = 20
  const iconColor = "#7c3aed"
  
  switch (category) {
    case "hypertension":
      return <Heart size={iconSize} color={iconColor} />
    case "diabetes":
      return <Activity size={iconSize} color={iconColor} />
    case "heart_disease":
      return <Heart size={iconSize} color={iconColor} />
    case "cholesterol":
      return <TrendingUp size={iconSize} color={iconColor} />
    case "anxiety":
    case "depression":
      return <Target size={iconSize} color={iconColor} />
    case "pain_relief":
      return <Zap size={iconSize} color={iconColor} />
    case "antibiotics":
      return <Shield size={iconSize} color={iconColor} />
    case "vitamins":
      return <Plus size={iconSize} color={iconColor} />
    default:
      return <MoreVertical size={iconSize} color={iconColor} />
  }
}

const getCategoryLabel = (category: string) => {
  const labels: { [key: string]: string } = {
    hypertension: "Hypertension",
    diabetes: "Diabetes",
    heart_disease: "Heart Disease",
    cholesterol: "Cholesterol",
    anxiety: "Anxiety",
    depression: "Depression",
    pain_relief: "Pain Relief",
    antibiotics: "Antibiotics",
    vitamins: "Vitamins",
    other: "Other",
  }
  return labels[category] || category
}

const getFrequencyLabel = (frequency: string) => {
  const labels: { [key: string]: string } = {
    once_daily: "Once daily",
    twice_daily: "Twice daily",
    three_times_daily: "3 times daily",
    four_times_daily: "4 times daily",
    as_needed: "As needed",
    custom: "Custom schedule",
  }
  return labels[frequency] || frequency
}

export function TemplateCard({ template, onSelect, showProvider = true }: TemplateCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onSelect(template)}>
      <View style={styles.header}>
        <View style={styles.nameSection}>
          <View style={styles.categoryIcon}>
            {getCategoryIcon(template.category)}
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{template.name}</Text>
            <Text style={styles.category}>{getCategoryLabel(template.category)}</Text>
          </View>
        </View>
        {template.isPublic && (
          <View style={styles.publicBadge}>
            <Text style={styles.publicText}>Public</Text>
          </View>
        )}
      </View>

      {template.description && (
        <Text style={styles.description} numberOfLines={2}>
          {template.description}
        </Text>
      )}

      <View style={styles.dosageRow}>
        <View style={styles.dosageInfo}>
          <Text style={styles.dosageLabel}>Dosage:</Text>
          <Text style={styles.dosageValue}>
            {template.dosage.amount} {template.dosage.unit}
          </Text>
        </View>
        <View style={styles.frequencyInfo}>
          <Text style={styles.frequencyLabel}>Frequency:</Text>
          <Text style={styles.frequencyValue}>
            {getFrequencyLabel(template.frequency)}
          </Text>
        </View>
      </View>

      {template.defaultDuration && (
        <Text style={styles.duration}>
          Default duration: {template.defaultDuration.amount} {template.defaultDuration.unit}
        </Text>
      )}

      {showProvider && template.provider && (
        <Text style={styles.provider}>
          By Dr. {template.provider.profile.firstName} {template.provider.profile.lastName}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.usageCount}>Used {template.usageCount} times</Text>
        {template.tags && template.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {template.tags.slice(0, 2).map((tag, index) => (
              <Text key={index} style={styles.tag}>
                {tag}
              </Text>
            ))}
            {template.tags.length > 2 && (
              <Text style={styles.tag}>+{template.tags.length - 2}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  nameSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  publicBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publicText: {
    fontSize: 10,
    fontFamily: "OpenSans-SemiBold",
    color: "#1e40af",
  },
  description: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 12,
  },
  dosageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dosageInfo: {
    flex: 1,
  },
  dosageLabel: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  dosageValue: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  frequencyInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  frequencyLabel: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  frequencyValue: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  duration: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginBottom: 8,
  },
  provider: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#7c3aed",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  usageCount: {
    fontSize: 11,
    fontFamily: "OpenSans-Regular",
    color: "#94a3b8",
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tag: {
    fontSize: 10,
    fontFamily: "OpenSans-Regular",
    color: "#7c3aed",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
})