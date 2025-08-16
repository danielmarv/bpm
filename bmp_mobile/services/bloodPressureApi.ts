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

  async createReading(
    reading: Omit<BloodPressureReading, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<BloodPressureReading> {
    try {
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
    } catch (error) {
      console.error("Error creating blood pressure reading:", error)
      throw error
    }
  }

  async getReadings(filters?: BloodPressureFilters): Promise<PaginatedResponse<BloodPressureReading>> {
    try {
      const headers = await this.getAuthHeaders()

      // Build query parameters
      const queryParams = new URLSearchParams()
      if (filters?.startDate) {
        queryParams.append("startDate", filters.startDate)
      }
      if (filters?.endDate) {
        queryParams.append("endDate", filters.endDate)
      }
      if (filters?.limit) {
        queryParams.append("limit", filters.limit.toString())
      }
      if (filters?.page) {
        queryParams.append("page", filters.page.toString())
      }

      const queryString = queryParams.toString()
      const url = `${API_URL}/blood-pressure${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const responseData: ApiResponse<PaginatedResponse<BloodPressureReading>> = await response.json()
      return responseData.data
    } catch (error) {
      console.error("Error fetching blood pressure readings:", error)
      throw error
    }
  }

  // Convenience methods for common queries
  async getRecentReadings(limit = 10): Promise<BloodPressureReading[]> {
    const response = await this.getReadings({ limit, page: 1 })
    return response.readings
  }

  async getReadingsInDateRange(startDate: string, endDate: string): Promise<BloodPressureReading[]> {
    const response = await this.getReadings({ startDate, endDate })
    return response.readings
  }

  async getTodaysReadings(): Promise<BloodPressureReading[]> {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

    return this.getReadingsInDateRange(startOfDay, endOfDay)
  }
}

// Export a singleton instance
export const bloodPressureApi = new BloodPressureApi()

// Export types for use in components
export type { BloodPressureReading, BloodPressureFilters, ApiResponse, PaginatedResponse }
