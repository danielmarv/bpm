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
  dosage: { amount: number; unit: string }
  frequency: "once_daily" | "twice_daily" | "three_times_daily" | "four_times_daily" | "as_needed" | "custom"
  startDate: string
  active: boolean
  sideEffects: string[]
  customSchedule: string[]
  reminderSchedule: { enabled: boolean; times: string[]; daysOfWeek: string[] }
  userId?: string
  createdAt?: string
  updatedAt?: string
}

interface MedicationFilters { active?: boolean }

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

interface AdherenceFilters { startDate?: string; endDate?: string }
interface AdherenceResponse {
  adherence: AdherenceRecord[]
  pagination?: { current: number; pages: number; total: number }
}

interface ApiResponse<T> { success: boolean; data: T; message?: string }

class MedicationsApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getItem("accessToken")
    return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) }
  }

  // --- Medications ---
  async createMedication(medication: Omit<Medication, "_id" | "userId" | "createdAt" | "updatedAt">): Promise<Medication> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medications`, { method: "POST", headers, body: JSON.stringify(medication) })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<Medication> = await res.json()
    return data.data
  }

  async getMedications(filters?: MedicationFilters): Promise<Medication[]> {
    const headers = await this.getAuthHeaders()
    const params = new URLSearchParams()
    if (filters?.active !== undefined) params.append("active", filters.active.toString())
    const res = await fetch(`${API_URL}/medications${params.toString() ? `?${params}` : ""}`, { method: "GET", headers })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<Medication[]> = await res.json()
    return data.data
  }

  async getMedicationById(id: string): Promise<Medication> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medications/${id}`, { method: "GET", headers })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<Medication> = await res.json()
    return data.data
  }

  async updateMedication(id: string, medication: Partial<Omit<Medication, "_id" | "userId" | "createdAt" | "updatedAt">>): Promise<Medication> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medications/${id}`, { method: "PUT", headers, body: JSON.stringify(medication) })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<Medication> = await res.json()
    return data.data
  }

  async deleteMedication(id: string): Promise<void> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medications/${id}`, { method: "DELETE", headers })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
  }

  async getUpcomingRefills(): Promise<Medication[]> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medications/refills`, { method: "GET", headers })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<Medication[]> = await res.json()
    return data.data
  }

  // --- Adherence ---
  async logAdherence(medicationId: string, taken: boolean, timestamp?: string, notes?: string): Promise<AdherenceRecord> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medications/${medicationId}/log`, {
      method: "POST",
      headers,
      body: JSON.stringify({ takenAt: timestamp || new Date().toISOString(), notes }),
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<AdherenceRecord> = await res.json()
    return data.data
  }

  async getAdherenceLogs(medicationId: string, filters?: AdherenceFilters & { limit?: number; page?: number }): Promise<AdherenceResponse> {
    const headers = await this.getAuthHeaders()
    const params = new URLSearchParams()
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (filters?.page) params.append("page", filters.page.toString())

    const res = await fetch(`${API_URL}/medications/${medicationId}/logs${params.toString() ? `?${params}` : ""}`, { method: "GET", headers })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<AdherenceResponse> = await res.json()
    return data.data
  }

  // Convenience methods
  async markAsTaken(medicationId: string, notes?: string) { return this.logAdherence(medicationId, true, undefined, notes) }
  async markAsSkipped(medicationId: string, notes?: string) { return this.logAdherence(medicationId, false, undefined, notes) }
}

export const medicationsApi = new MedicationsApi()
export type { Medication, MedicationFilters, AdherenceRecord, AdherenceFilters, AdherenceResponse, ApiResponse }
