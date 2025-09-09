"use client"

import type React from "react"
import { View, Text } from "react-native"
import { Picker } from "@react-native-picker/picker"

interface UserFiltersProps {
  selectedRole: string
  onRoleChange: (role: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  selectedRole,
  onRoleChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <View style={{ padding: 16, backgroundColor: "#f8f9fa" }}>
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" }}>Filter Users</Text>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 14, marginBottom: 4, color: "#666" }}>Role</Text>
        <Picker
          selectedValue={selectedRole}
          onValueChange={onRoleChange}
          style={{ backgroundColor: "#fff", borderRadius: 8 }}
        >
          <Picker.Item label="All Roles" value="" />
          <Picker.Item label="Patient" value="patient" />
          <Picker.Item label="Provider" value="provider" />
          <Picker.Item label="Admin" value="admin" />
        </Picker>
      </View>
    </View>
  )
}
