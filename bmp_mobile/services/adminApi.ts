import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"

const API_URL = "https://bpm-ctw9.onrender.com/api"

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key)
    }
    return await SecureStore.getItemAsync(key)
  },
}

export interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalReadings: number
  totalProviders: number
  totalPatients: number
  systemHealth: number
  serverUptime: number
  databaseSize: number
}

export interface UserManagementData {
  _id: string
  email: string
  role: "patient" | "provider" | "admin"
  profile: {
    firstName: string
    lastName: string
    phone?: string
  }
  status: "active" | "inactive" | "suspended"
  lastActive: string
  createdAt: string
}

export interface CreateUserPayload {
  email: string
  password: string
  role: "patient" | "provider" | "admin"
  profile: {
    firstName: string
    lastName: string
    phone?: string
  }
}

export interface UpdateUserPayload {
  email?: string
  role?: "patient" | "provider" | "admin"
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
  }
  status?: "active" | "inactive" | "suspended"
}

export interface SystemSettings {
  maintenanceMode: boolean
  registrationEnabled: boolean
  maxUsersPerProvider: number
  dataRetentionDays: number
  backupFrequency: "daily" | "weekly" | "monthly"
  emailNotifications: boolean
  smsNotifications: boolean
}

export interface AuditLog {
  _id: string
  userId: string
  action: string
  resource: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: string
}

export interface SystemReport {
  period: "daily" | "weekly" | "monthly"
  startDate: string
  endDate: string
  userGrowth: number
  activeUserRate: number
  averageReadingsPerUser: number
  topProviders: Array<{
    providerId: string
    name: string
    patientCount: number
  }>
  systemAlerts: Array<{
    type: "warning" | "error" | "info"
    message: string
    timestamp: string
  }>
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

class AdminApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getItem("accessToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // System Statistics
  async getSystemStats(): Promise<SystemStats> {
    // Placeholder - return mock data until backend implements these endpoints
    return {
      totalUsers: 150,
      activeUsers: 89,
      totalReadings: 2340,
      totalProviders: 12,
      totalPatients: 138,
      systemHealth: 98,
      serverUptime: 99.9,
      databaseSize: 2.4,
    }
  }

  // User Management
  async getAllUsersForAdmin(filters?: {
    page?: number
    limit?: number
    role?: string
    search?: string
  }): Promise<{ users: UserManagementData[]; total: number; pages: number }> {
    const headers = await this.getAuthHeaders()
    const query = new URLSearchParams()
    if (filters?.page) query.append("page", filters.page.toString())
    if (filters?.limit) query.append("limit", filters.limit.toString())
    if (filters?.role) query.append("role", filters.role)
    if (filters?.search) query.append("search", filters.search)

    const url = `${API_URL}/users${query.toString() ? `?${query.toString()}` : ""}`
    const response = await fetch(url, { method: "GET", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<{ users: UserManagementData[]; total: number; pages: number }> = await response.json()
    return data.data
  }

  async createUser(userData: CreateUserPayload): Promise<UserManagementData> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(userData),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<UserManagementData> = await response.json()
    return data.data
  }

  async updateUser(userId: string, updates: UpdateUserPayload): Promise<UserManagementData> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<UserManagementData> = await response.json()
    return data.data
  }

  async updateUserRole(userId: string, role: "patient" | "provider" | "admin"): Promise<UserManagementData> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/${userId}/role`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ role }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<UserManagementData> = await response.json()
    return data.data
  }

  async getUserById(userId: string): Promise<UserManagementData> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/${userId}`, { method: "GET", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<UserManagementData> = await response.json()
    return data.data
  }

  async deleteUser(userId: string): Promise<void> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/${userId}`, { method: "DELETE", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
  }

  async suspendUser(userId: string, reason?: string): Promise<UserManagementData> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/${userId}/suspend`, {
      method: "POST",
      headers,
      body: JSON.stringify({ reason }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<UserManagementData> = await response.json()
    return data.data
  }

  async reactivateUser(userId: string): Promise<UserManagementData> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/${userId}/reactivate`, {
      method: "POST",
      headers,
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<UserManagementData> = await response.json()
    return data.data
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSettings> {
    // Placeholder - return mock data until backend implements these endpoints
    return {
      maintenanceMode: false,
      registrationEnabled: true,
      maxUsersPerProvider: 50,
      dataRetentionDays: 365,
      backupFrequency: "daily",
      emailNotifications: true,
      smsNotifications: false,
    }
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    // Placeholder - return updated mock data until backend implements these endpoints
    return { ...(await this.getSystemSettings()), ...settings }
  }

  // Audit Logs
  async getAuditLogs(filters?: {
    page?: number
    limit?: number
    userId?: string
    action?: string
    startDate?: string
    endDate?: string
  }): Promise<{ logs: AuditLog[]; total: number; pages: number }> {
    // Placeholder - return mock data until backend implements these endpoints
    return {
      logs: [],
      total: 0,
      pages: 0,
    }
  }

  // Reports
  async generateSystemReport(
    period: "daily" | "weekly" | "monthly",
    startDate?: string,
    endDate?: string,
  ): Promise<SystemReport> {
    // Placeholder - return mock data until backend implements these endpoints
    return {
      period,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date().toISOString(),
      userGrowth: 15,
      activeUserRate: 78,
      averageReadingsPerUser: 12.5,
      topProviders: [],
      systemAlerts: [],
    }
  }

  // System Health
  async getSystemHealth(): Promise<{
    status: "healthy" | "warning" | "critical"
    uptime: number
    memoryUsage: number
    cpuUsage: number
    diskUsage: number
    databaseConnections: number
    activeUsers: number
    lastBackup: string
  }> {
    // Placeholder - return mock data until backend implements these endpoints
    return {
      status: "healthy",
      uptime: 99.9,
      memoryUsage: 45,
      cpuUsage: 23,
      diskUsage: 67,
      databaseConnections: 8,
      activeUsers: 89,
      lastBackup: new Date().toISOString(),
    }
  }

  // Backup Management
  async createBackup(): Promise<{ backupId: string; status: string; createdAt: string }> {
    // Placeholder - return mock data until backend implements these endpoints
    return {
      backupId: `backup_${Date.now()}`,
      status: "completed",
      createdAt: new Date().toISOString(),
    }
  }

  async getBackupHistory(): Promise<
    Array<{
      _id: string
      status: "completed" | "failed" | "in-progress"
      size: number
      createdAt: string
      completedAt?: string
    }>
  > {
    // Placeholder - return mock data until backend implements these endpoints
    return []
  }
}

export const adminApi = new AdminApi()
