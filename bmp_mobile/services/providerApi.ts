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

export interface PatientData {
  _id: string
  email: string
  profile: {
    firstName: string
    lastName: string
    dateOfBirth: string
    phone?: string
  }
  lastReading?: {
    systolic: number
    diastolic: number
    pulse: number
    timestamp: string
  }
  riskLevel: "low" | "medium" | "high"
  compliance: number
  status: "active" | "inactive"
  assignedAt: string
}

export interface ProviderStats {
  totalPatients: number
  activePatients: number
  criticalAlerts: number
  averageCompliance: number
  recentReadings: number
}

export interface PatientAlert {
  _id: string
  patientId: string
  patientName: string
  type: "high_bp" | "low_bp" | "missed_medication" | "no_readings"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: string
  acknowledged: boolean
}

export interface CreatePatientPayload {
  email: string
  password: string
  role: "patient"
  profile: {
    firstName: string
    lastName: string
    phone?: string
    dateOfBirth?: string
  }
}

export interface ResourceAssignmentPayload {
  notes?: string
  priority?: "low" | "medium" | "high"
  dueDate?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

class ProviderApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getItem("accessToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Provider Statistics
  async getProviderStats(): Promise<ProviderStats> {
    return {
      totalPatients: 25,
      activePatients: 22,
      criticalAlerts: 3,
      averageCompliance: 78,
      recentReadings: 45,
    }
  }

  // Patient Management - Using actual backend endpoints
  async getMyPatients(filters?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{ patients: PatientData[]; total: number; pages: number }> {
    const headers = await this.getAuthHeaders()
    const query = new URLSearchParams()
    if (filters?.page) query.append("page", filters.page.toString())
    if (filters?.limit) query.append("limit", filters.limit.toString())
    if (filters?.search) query.append("search", filters.search)

    const url = `${API_URL}/users/my-patients${query.toString() ? `?${query.toString()}` : ""}`
    const response = await fetch(url, { method: "GET", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<{ patients: PatientData[]; total: number; pages: number }> = await response.json()
    return data.data
  }

  async getPatientDetails(patientId: string): Promise<
    PatientData & {
      recentReadings: Array<{
        systolic: number
        diastolic: number
        pulse: number
        timestamp: string
        notes?: string
      }>
      medications: Array<{
        name: string
        dosage: string
        frequency: string
        compliance: number
      }>
    }
  > {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/${patientId}`, { method: "GET", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<any> = await response.json()
    return data.data
  }

  async createPatient(payload: CreatePatientPayload): Promise<PatientData> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<PatientData> = await response.json()
    return data.data
  }

  // Resource Management - Using actual backend endpoints
  async assignResourceToPatient(
    resourceId: string,
    patientId: string,
    payload?: ResourceAssignmentPayload,
  ): Promise<void> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/resources/assign/${resourceId}/${patientId}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload || {}),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
  }

  async getMyResourceAssignments(filters?: {
    page?: number
    limit?: number
    patientId?: string
    status?: "assigned" | "viewed" | "completed"
  }): Promise<{ assignments: any[]; total: number; pages: number }> {
    const headers = await this.getAuthHeaders()
    const query = new URLSearchParams()
    if (filters?.page) query.append("page", filters.page.toString())
    if (filters?.limit) query.append("limit", filters.limit.toString())
    if (filters?.patientId) query.append("patientId", filters.patientId)
    if (filters?.status) query.append("status", filters.status)

    const url = `${API_URL}/resources/my-assignments${query.toString() ? `?${query.toString()}` : ""}`
    const response = await fetch(url, { method: "GET", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<{ assignments: any[]; total: number; pages: number }> = await response.json()
    return data.data
  }

  async removeResourceAssignment(assignmentId: string): Promise<void> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/resources/assignment/${assignmentId}`, {
      method: "DELETE",
      headers,
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
  }

  // Messaging - Using actual backend endpoints
  async sendMessageToPatient(
    patientId: string,
    subject: string,
    body: string,
    priority?: "low" | "normal" | "high" | "urgent",
  ): Promise<void> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        receiverId: patientId,
        subject,
        body,
        priority: priority || "normal",
      }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
  }

  async getMessages(filters?: {
    page?: number
    limit?: number
    type?: "inbox" | "sent"
    unread?: boolean
  }): Promise<{ messages: any[]; total: number; pages: number }> {
    const headers = await this.getAuthHeaders()
    const query = new URLSearchParams()
    if (filters?.page) query.append("page", filters.page.toString())
    if (filters?.limit) query.append("limit", filters.limit.toString())
    if (filters?.type) query.append("type", filters.type)
    if (filters?.unread !== undefined) query.append("unread", filters.unread.toString())

    const url = `${API_URL}/messages${query.toString() ? `?${query.toString()}` : ""}`
    const response = await fetch(url, { method: "GET", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<{ messages: any[]; total: number; pages: number }> = await response.json()
    return data.data
  }

  // Patient Alerts - Mock data until backend implements
  async getPatientAlerts(filters?: {
    page?: number
    limit?: number
    severity?: string
    acknowledged?: boolean
  }): Promise<{ alerts: PatientAlert[]; total: number; pages: number }> {
    return {
      alerts: [],
      total: 0,
      pages: 0,
    }
  }

  async acknowledgeAlert(alertId: string): Promise<PatientAlert> {
    return {
      _id: alertId,
      patientId: "",
      patientName: "",
      type: "high_bp",
      severity: "medium",
      message: "",
      timestamp: new Date().toISOString(),
      acknowledged: true,
    }
  }

  // Provider Reports - Mock data until backend implements
  async generatePatientReport(
    patientId: string,
    period: "week" | "month" | "quarter",
  ): Promise<{
    patientInfo: PatientData
    readingsSummary: {
      averageSystolic: number
      averageDiastolic: number
      readingsCount: number
      trend: "improving" | "stable" | "concerning"
    }
    medicationCompliance: number
    recommendations: string[]
  }> {
    const patientInfo = await this.getPatientDetails(patientId)
    return {
      patientInfo,
      readingsSummary: {
        averageSystolic: 125,
        averageDiastolic: 80,
        readingsCount: 15,
        trend: "stable",
      },
      medicationCompliance: 85,
      recommendations: ["Continue current medication regimen", "Increase physical activity", "Monitor sodium intake"],
    }
  }
}

export const providerApi = new ProviderApi()
