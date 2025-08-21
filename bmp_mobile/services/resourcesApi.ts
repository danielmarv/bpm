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

export interface Resource {
  _id?: string
  title: string
  content: string
  category: "hypertension" | "diet" | "exercise" | "medication" | "lifestyle" | "general"
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ResourceFilters {
  category?: Resource["category"]
  search?: string
  limit?: number
  page?: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

class ResourcesApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getItem("accessToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async createResource(resource: Omit<Resource, "_id" | "createdAt" | "updatedAt">): Promise<Resource> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/resources`, {
      method: "POST",
      headers,
      body: JSON.stringify(resource),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<Resource> = await response.json()
    return data.data
  }

  async getResources(filters?: ResourceFilters): Promise<Resource[]> {
    const headers = await this.getAuthHeaders()
    const query = new URLSearchParams()
    if (filters?.category) query.append("category", filters.category)
    if (filters?.search) query.append("search", filters.search)
    if (filters?.limit) query.append("limit", filters.limit.toString())
    if (filters?.page) query.append("page", filters.page.toString())

    const url = `${API_URL}/resources${query.toString() ? `?${query.toString()}` : ""}`
    const response = await fetch(url, { method: "GET", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<Resource[]> = await response.json()
    return data.data
  }

  async getResourceById(id: string): Promise<Resource> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/resources/${id}`, { method: "GET", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<Resource> = await response.json()
    return data.data
  }

  async updateResource(id: string, resource: Partial<Omit<Resource, "_id" | "createdAt" | "updatedAt">>): Promise<Resource> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/resources/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(resource),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<Resource> = await response.json()
    return data.data
  }

  async deleteResource(id: string): Promise<void> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/resources/${id}`, { method: "DELETE", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
  }

  async getCategories(): Promise<string[]> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/resources/categories`, { method: "GET", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<string[]> = await response.json()
    return data.data
  }
}

export const resourcesApi = new ResourcesApi()
