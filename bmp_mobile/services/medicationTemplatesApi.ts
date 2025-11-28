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

export interface MedicationTemplate {
  _id: string
  providerId: string
  name: string
  description?: string
  dosage: {
    amount: number
    unit: string
  }
  frequency: "once_daily" | "twice_daily" | "three_times_daily" | "four_times_daily" | "as_needed" | "custom"
  customSchedule?: Array<{
    time: string
    days: string[]
  }>
  category: "hypertension" | "diabetes" | "heart_disease" | "cholesterol" | "anxiety" | "depression" | "pain_relief" | "antibiotics" | "vitamins" | "other"
  instructions?: string
  commonSideEffects?: string[]
  warnings?: string[]
  defaultDuration?: {
    amount: number
    unit: "days" | "weeks" | "months" | "years"
  }
  isActive: boolean
  isPublic: boolean
  tags: string[]
  usageCount: number
  approvalStatus: "pending" | "approved" | "rejected"
  provider?: {
    profile: {
      firstName: string
      lastName: string
    }
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface TemplateCategory {
  value: string
  label: string
  icon: string
}

export interface TemplateFilters {
  category?: string
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface CreateTemplatePayload {
  name: string
  description?: string
  dosage: {
    amount: number
    unit: string
  }
  frequency: string
  customSchedule?: Array<{
    time: string
    days: string[]
  }>
  category: string
  instructions?: string
  commonSideEffects?: string[]
  warnings?: string[]
  defaultDuration?: {
    amount: number
    unit: string
  }
  isPublic?: boolean
  tags?: string[]
}

export interface CreateFromTemplatePayload {
  startDate: string
  endDate?: string
  customizations?: {
    name?: string
    dosage?: {
      amount: number
      unit: string
    }
    frequency?: string
    instructions?: string
    reminderSchedule?: {
      enabled: boolean
      times: string[]
      daysOfWeek: number[]
    }
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    templates: T[]
    pagination: {
      current: number
      pages: number
      total: number
    }
  }
}

class MedicationTemplatesApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getItem("accessToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // --- Template Management (Provider) ---
  async createTemplate(template: CreateTemplatePayload): Promise<MedicationTemplate> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medication-templates`, {
      method: "POST",
      headers,
      body: JSON.stringify(template),
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<MedicationTemplate> = await res.json()
    return data.data
  }

  async getProviderTemplates(filters?: TemplateFilters): Promise<PaginatedResponse<MedicationTemplate>["data"]> {
    const headers = await this.getAuthHeaders()
    const params = new URLSearchParams()
    if (filters?.category) params.append("category", filters.category)
    if (filters?.search) params.append("search", filters.search)
    if (filters?.isActive !== undefined) params.append("isActive", filters.isActive.toString())
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    
    const res = await fetch(`${API_URL}/medication-templates/provider?${params}`, {
      method: "GET",
      headers,
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const response: PaginatedResponse<MedicationTemplate> = await res.json()
    return response.data
  }

  async updateTemplate(id: string, template: Partial<CreateTemplatePayload>): Promise<MedicationTemplate> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medication-templates/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(template),
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<MedicationTemplate> = await res.json()
    return data.data
  }

  async deleteTemplate(id: string): Promise<void> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medication-templates/${id}`, {
      method: "DELETE",
      headers,
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
  }

  // --- Template Browsing (Patient) ---
  async getPublicTemplates(filters?: TemplateFilters): Promise<PaginatedResponse<MedicationTemplate>["data"]> {
    const headers = await this.getAuthHeaders()
    const params = new URLSearchParams()
    if (filters?.category) params.append("category", filters.category)
    if (filters?.search) params.append("search", filters.search)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    
    const res = await fetch(`${API_URL}/medication-templates/public?${params}`, {
      method: "GET",
      headers,
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const response: PaginatedResponse<MedicationTemplate> = await res.json()
    return response.data
  }

  async getAvailableTemplates(filters?: TemplateFilters): Promise<PaginatedResponse<MedicationTemplate>["data"]> {
    const headers = await this.getAuthHeaders()
    const params = new URLSearchParams()
    if (filters?.category) params.append("category", filters.category)
    if (filters?.search) params.append("search", filters.search)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    
    const res = await fetch(`${API_URL}/medications/templates/available?${params}`, {
      method: "GET",
      headers,
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const response: PaginatedResponse<MedicationTemplate> = await res.json()
    return response.data
  }

  async getTemplate(id: string): Promise<MedicationTemplate> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medication-templates/${id}`, {
      method: "GET",
      headers,
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<MedicationTemplate> = await res.json()
    return data.data
  }

  // --- Template Categories ---
  async getCategories(): Promise<TemplateCategory[]> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medication-templates/categories`, {
      method: "GET",
      headers,
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<TemplateCategory[]> = await res.json()
    return data.data
  }

  // --- Create Medication from Template ---
  async createMedicationFromTemplate(templateId: string, payload: CreateFromTemplatePayload): Promise<any> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medications/from-template/${templateId}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<any> = await res.json()
    return data.data
  }

  // --- Provider Prescribe from Template ---
  async prescribeFromTemplate(patientId: string, templateId: string, payload: CreateFromTemplatePayload): Promise<any> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medications/prescribe-from-template/${patientId}/${templateId}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<any> = await res.json()
    return data.data
  }

  // --- Admin Functions ---
  async getPendingTemplates(filters?: { page?: number; limit?: number }): Promise<PaginatedResponse<MedicationTemplate>["data"]> {
    const headers = await this.getAuthHeaders()
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    
    const res = await fetch(`${API_URL}/medication-templates/pending?${params}`, {
      method: "GET",
      headers,
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const response: PaginatedResponse<MedicationTemplate> = await res.json()
    return response.data
  }

  async approveTemplate(id: string, action: "approve" | "reject"): Promise<MedicationTemplate> {
    const headers = await this.getAuthHeaders()
    const res = await fetch(`${API_URL}/medication-templates/${id}/approve`, {
      method: "POST",
      headers,
      body: JSON.stringify({ action }),
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const data: ApiResponse<MedicationTemplate> = await res.json()
    return data.data
  }
}

export const medicationTemplatesApi = new MedicationTemplatesApi()