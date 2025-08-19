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

interface Medication {
  _id?: string
  name: string
  dosage: {
    amount: number
    unit: string
  }
  frequency:
    | "once_daily"
    | "twice_daily"
    | "three_times_daily"
    | "four_times_daily"
    | "as_needed"
  startDate: string
  active: boolean
  sideEffects: string[]
  customSchedule: string[]
  reminderSchedule: {
    enabled: boolean
    times: string[]
    daysOfWeek: string[]
  }
  userId?: string
  createdAt?: string
  updatedAt?: string
}

interface MedicationFilters {
  active?: boolean
}

interface AdherenceRecord {
  _id: string
  medicationId: string
  taken: boolean
  timestamp: string
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface AdherenceFilters {
  startDate?: string
  endDate?: string
}

interface AdherenceResponse {
  adherence: AdherenceRecord[]
  pagination?: {
    current: number
    pages: number
    total: number
  }
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

class MedicationsApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getItem("accessToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async createMedication(
    medication: Omit<
      Medication,
      "_id" | "userId" | "createdAt" | "updatedAt"
    >,
  ): Promise<Medication> {
    try {
      const headers = await this.getAuthHeaders()

      const response = await fetch(`${API_URL}/medications`, {
        method: "POST",
        headers,
        body: JSON.stringify(medication),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        )
      }

      const responseData: ApiResponse<Medication> = await response.json()
      return responseData.data
    } catch (error) {
      console.error("Error creating medication:", error)
      throw error
    }
  }

  async getMedications(filters?: MedicationFilters): Promise<Medication[]> {
    try {
      const headers = await this.getAuthHeaders()

      const queryParams = new URLSearchParams()
      if (filters?.active !== undefined) {
        queryParams.append("active", filters.active.toString())
      }

      const queryString = queryParams.toString()
      const url = `${API_URL}/medications${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        )
      }

      const responseData: ApiResponse<Medication[]> = await response.json()
      return responseData.data
    } catch (error) {
      console.error("Error fetching medications:", error)
      throw error
    }
  }

  async getActiveMedications(): Promise<Medication[]> {
    return this.getMedications({ active: true })
  }

  async getInactiveMedications(): Promise<Medication[]> {
    return this.getMedications({ active: false })
  }

  async getAllMedications(): Promise<Medication[]> {
    return this.getMedications()
  }

  async logAdherence(
    medicationId: string,
    adherenceData: { taken: boolean; timestamp?: string; notes?: string },
  ): Promise<AdherenceRecord> {
    try {
      const headers = await this.getAuthHeaders()

      const response = await fetch(
        `${API_URL}/medications/${medicationId}/adherence`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            taken: adherenceData.taken,
            timestamp: adherenceData.timestamp || new Date().toISOString(),
            notes: adherenceData.notes,
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        )
      }

      const responseData: ApiResponse<AdherenceRecord> = await response.json()
      return responseData.data
    } catch (error) {
      console.error("Error logging adherence:", error)
      throw error
    }
  }

  async getAdherence(
    medicationId: string,
    filters?: AdherenceFilters,
  ): Promise<AdherenceResponse> {
    try {
      const headers = await this.getAuthHeaders()

      const queryParams = new URLSearchParams()
      if (filters?.startDate) {
        queryParams.append("startDate", filters.startDate)
      }
      if (filters?.endDate) {
        queryParams.append("endDate", filters.endDate)
      }

      const queryString = queryParams.toString()
      const url = `${API_URL}/medications/${medicationId}/adherence${
        queryString ? `?${queryString}` : ""
      }`

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        )
      }

      const responseData: ApiResponse<AdherenceResponse> = await response.json()
      return responseData.data
    } catch (error) {
      console.error("Error fetching adherence:", error)
      throw error
    }
  }

  async markAsTaken(
    medicationId: string,
    notes?: string,
  ): Promise<AdherenceRecord> {
    return this.logAdherence(medicationId, { taken: true, notes })
  }

  async markAsSkipped(
    medicationId: string,
    notes?: string,
  ): Promise<AdherenceRecord> {
    return this.logAdherence(medicationId, { taken: false, notes })
  }

  async getTodayAdherence(
    medicationId: string,
  ): Promise<AdherenceResponse> {
    const today = new Date().toISOString().split("T")[0]
    return this.getAdherence(medicationId, {
      startDate: today,
      endDate: today,
    })
  }

  async getWeeklyAdherence(
    medicationId: string,
  ): Promise<AdherenceResponse> {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return this.getAdherence(medicationId, {
      startDate: weekAgo.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    })
  }
}

export const medicationsApi = new MedicationsApi()

export type {
  Medication,
  MedicationFilters,
  AdherenceRecord,
  AdherenceFilters,
  AdherenceResponse,
  ApiResponse,
}
