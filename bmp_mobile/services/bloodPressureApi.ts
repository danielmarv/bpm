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

interface BloodPressureReading {
  id?: string
  systolic: number
  diastolic: number
  pulse?: number
  timestamp: string
  notes?: string
  userId?: string
  createdAt?: string
  updatedAt?: string
}

interface BloodPressureFilters {
  startDate?: string
  endDate?: string
  limit?: number
  page?: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface PaginatedResponse<T> {
  readings: T[]
  pagination: {
    current: number
    pages: number
    total: number
  }
}

class BloodPressureApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getItem("accessToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Create a new reading
  async createReading(
    reading: Omit<BloodPressureReading, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<BloodPressureReading> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/blood-pressure`, {
      method: "POST",
      headers,
      body: JSON.stringify(reading),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const responseData: ApiResponse<BloodPressureReading> = await response.json()
    return responseData.data
  }

  // Get readings with filters and pagination
  async getReadings(filters?: BloodPressureFilters): Promise<PaginatedResponse<BloodPressureReading>> {
    const headers = await this.getAuthHeaders()
    const queryParams = new URLSearchParams()
    if (filters?.startDate) queryParams.append("startDate", filters.startDate)
    if (filters?.endDate) queryParams.append("endDate", filters.endDate)
    if (filters?.limit) queryParams.append("limit", filters.limit.toString())
    if (filters?.page) queryParams.append("page", filters.page.toString())

    const url = `${API_URL}/blood-pressure${queryParams.toString() ? `?${queryParams}` : ""}`
    const response = await fetch(url, { method: "GET", headers })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const responseData: ApiResponse<PaginatedResponse<BloodPressureReading>> = await response.json()
    return responseData.data
  }

  // Get abnormal readings
  async getAbnormalReadings(limit = 10, page = 1): Promise<PaginatedResponse<BloodPressureReading>> {
    const headers = await this.getAuthHeaders()
    const queryParams = new URLSearchParams()
    queryParams.append("limit", limit.toString())
    queryParams.append("page", page.toString())

    const response = await fetch(`${API_URL}/blood-pressure/abnormal?${queryParams}`, { method: "GET", headers })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const responseData: ApiResponse<PaginatedResponse<BloodPressureReading>> = await response.json()
    return responseData.data
  }

  // Get blood pressure statistics
  async getReadingStats(startDate?: string, endDate?: string): Promise<any> {
    const headers = await this.getAuthHeaders()
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.append("startDate", startDate)
    if (endDate) queryParams.append("endDate", endDate)

    const response = await fetch(`${API_URL}/blood-pressure/stats${queryParams.toString() ? `?${queryParams}` : ""}`, { method: "GET", headers })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const responseData: ApiResponse<any> = await response.json()
    return responseData.data
  }

  // Get a single reading by ID
  async getReadingById(id: string): Promise<BloodPressureReading> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/blood-pressure/${id}`, { method: "GET", headers })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    const responseData: ApiResponse<BloodPressureReading> = await response.json()
    return responseData.data
  }

  // Update a reading by ID
  async updateReading(id: string, reading: Omit<BloodPressureReading, "id" | "userId" | "createdAt" | "updatedAt">): Promise<BloodPressureReading> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/blood-pressure/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(reading),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    const responseData: ApiResponse<BloodPressureReading> = await response.json()
    return responseData.data
  }

  // Delete a reading by ID
  async deleteReading(id: string): Promise<void> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/blood-pressure/${id}`, { method: "DELETE", headers })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
  }
}

// Export singleton instance
export const bloodPressureApi = new BloodPressureApi()
export type { BloodPressureReading, BloodPressureFilters, ApiResponse, PaginatedResponse }
