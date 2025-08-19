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

interface Activity {
  id?: string
  type: "exercise" | "diet" | "weight" | "stress_reduction"
  date: string
  data: Record<string, any>
  userId?: string
  createdAt?: string
  updatedAt?: string
}

interface ActivityFilters {
  type?: "exercise" | "diet" | "weight" | "stress_reduction"
  startDate?: string
  endDate?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

class ActivitiesApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getItem("accessToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Log a new activity
  async logActivity(activity: Omit<Activity, "id" | "userId" | "createdAt" | "updatedAt">): Promise<Activity> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/activities`, {
      method: "POST",
      headers,
      body: JSON.stringify(activity),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const responseData: ApiResponse<Activity> = await response.json()
    return responseData.data
  }

  // Get all activities (with optional filters)
  async getActivities(filters?: ActivityFilters): Promise<Activity[]> {
    const headers = await this.getAuthHeaders()
    const queryParams = new URLSearchParams()
    if (filters?.type) queryParams.append("type", filters.type)
    if (filters?.startDate) queryParams.append("startDate", filters.startDate)
    if (filters?.endDate) queryParams.append("endDate", filters.endDate)

    const url = `${API_URL}/activities${queryParams.toString() ? `?${queryParams}` : ""}`
    const response = await fetch(url, { method: "GET", headers })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const responseData: ApiResponse<Activity[]> = await response.json()
    return responseData.data
  }

  // Get activity stats
  async getActivityStats(): Promise<any> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/activities/stats`, { method: "GET", headers })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const responseData: ApiResponse<any> = await response.json()
    return responseData.data
  }

  // Get a single activity by ID
  async getActivityById(id: string): Promise<Activity> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/activities/${id}`, { method: "GET", headers })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const responseData: ApiResponse<Activity> = await response.json()
    return responseData.data
  }

  // Update activity by ID
  async updateActivity(id: string, activity: Omit<Activity, "id" | "userId" | "createdAt" | "updatedAt">): Promise<Activity> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/activities/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(activity),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const responseData: ApiResponse<Activity> = await response.json()
    return responseData.data
  }

  // Delete activity by ID
  async deleteActivity(id: string): Promise<void> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/activities/${id}`, { method: "DELETE", headers })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
  }

  // Convenience methods
  async logExercise(date: string, data: Record<string, any>) {
    return this.logActivity({ type: "exercise", date, data })
  }
  async logDiet(date: string, data: Record<string, any>) {
    return this.logActivity({ type: "diet", date, data })
  }
  async logWeight(date: string, data: Record<string, any>) {
    return this.logActivity({ type: "weight", date, data })
  }
  async logStressReduction(date: string, data: Record<string, any>) {
    return this.logActivity({ type: "stress_reduction", date, data })
  }
  async getExerciseActivities(startDate?: string, endDate?: string) {
    return this.getActivities({ type: "exercise", startDate, endDate })
  }
  async getDietActivities(startDate?: string, endDate?: string) {
    return this.getActivities({ type: "diet", startDate, endDate })
  }
  async getWeightActivities(startDate?: string, endDate?: string) {
    return this.getActivities({ type: "weight", startDate, endDate })
  }
  async getStressReductionActivities(startDate?: string, endDate?: string) {
    return this.getActivities({ type: "stress_reduction", startDate, endDate })
  }
}

// Export singleton instance
export const activitiesApi = new ActivitiesApi()
export type { Activity, ActivityFilters, ApiResponse }
