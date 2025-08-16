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

  async logActivity(activity: Omit<Activity, "id" | "userId" | "createdAt" | "updatedAt">): Promise<Activity> {
    try {
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
    } catch (error) {
      console.error("Error logging activity:", error)
      throw error
    }
  }

  async getActivities(filters?: ActivityFilters): Promise<Activity[]> {
    try {
      const headers = await this.getAuthHeaders()

      // Build query parameters
      const queryParams = new URLSearchParams()
      if (filters?.type) {
        queryParams.append("type", filters.type)
      }
      if (filters?.startDate) {
        queryParams.append("startDate", filters.startDate)
      }
      if (filters?.endDate) {
        queryParams.append("endDate", filters.endDate)
      }

      const queryString = queryParams.toString()
      const url = `${API_URL}/activities${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const responseData: ApiResponse<Activity[]> = await response.json()
      return responseData.data
    } catch (error) {
      console.error("Error fetching activities:", error)
      throw error
    }
  }

  // Convenience methods for specific activity types
  async logExercise(date: string, data: Record<string, any>): Promise<Activity> {
    return this.logActivity({ type: "exercise", date, data })
  }

  async logDiet(date: string, data: Record<string, any>): Promise<Activity> {
    return this.logActivity({ type: "diet", date, data })
  }

  async logWeight(date: string, data: Record<string, any>): Promise<Activity> {
    return this.logActivity({ type: "weight", date, data })
  }

  async logStressReduction(date: string, data: Record<string, any>): Promise<Activity> {
    return this.logActivity({ type: "stress_reduction", date, data })
  }

  // Convenience methods for filtered queries
  async getExerciseActivities(startDate?: string, endDate?: string): Promise<Activity[]> {
    return this.getActivities({ type: "exercise", startDate, endDate })
  }

  async getDietActivities(startDate?: string, endDate?: string): Promise<Activity[]> {
    return this.getActivities({ type: "diet", startDate, endDate })
  }

  async getWeightActivities(startDate?: string, endDate?: string): Promise<Activity[]> {
    return this.getActivities({ type: "weight", startDate, endDate })
  }

  async getStressReductionActivities(startDate?: string, endDate?: string): Promise<Activity[]> {
    return this.getActivities({ type: "stress_reduction", startDate, endDate })
  }
}

// Export a singleton instance
export const activitiesApi = new ActivitiesApi()

// Export types for use in components
export type { Activity, ActivityFilters, ApiResponse }
