"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { User, MoreVertical, Shield, Stethoscope } from "../ui/Icons"
import { adminApi, type UserManagementData } from "../../services/adminApi"

interface UserListProps {
  searchQuery: string
  filters: {
    role: string
    status: string
    dateRange: string
  }
}

export function UserList({ searchQuery, filters }: UserListProps) {
  const [users, setUsers] = useState<UserManagementData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminApi.getAllUsersForAdmin({
          search: searchQuery || undefined,
          role: filters.role !== "all" ? filters.role : undefined,
          page: 1,
          limit: 50,
        })
        setUsers(response.users)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [searchQuery, filters])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield size={16} color="#dc2626" />
      case "provider":
        return <Stethoscope size={16} color="#059669" />
      default:
        return <User size={16} color="#3b82f6" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "#dc2626"
      case "provider":
        return "#059669"
      default:
        return "#3b82f6"
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {users.map((user) => (
        <View key={user._id} style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.profile.firstName[0]}
                {user.profile.lastName[0]}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user.profile.firstName} {user.profile.lastName}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.userMeta}>
                <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(user.role)}20` }]}>
                  {getRoleIcon(user.role)}
                  <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>{user.role}</Text>
                </View>
                <View
                  style={[styles.statusBadge, user.status === "active" ? styles.activeStatus : styles.inactiveStatus]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      user.status === "active" ? styles.activeStatusText : styles.inactiveStatusText,
                    ]}
                  >
                    {user.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <MoreVertical size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      ))}
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
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#475569",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: "row",
    gap: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    textTransform: "capitalize",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeStatus: {
    backgroundColor: "#ecfdf5",
  },
  inactiveStatus: {
    backgroundColor: "#fef2f2",
  },
  statusText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    textTransform: "capitalize",
  },
  activeStatusText: {
    color: "#10b981",
  },
  inactiveStatusText: {
    color: "#ef4444",
  },
  menuButton: {
    padding: 8,
  },
})
