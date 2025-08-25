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

export interface UserProfile {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
}

export interface BPThresholds {
  systolicHigh?: number
  systolicLow?: number
  diastolicHigh?: number
  diastolicLow?: number
}

export interface User {
  _id?: string
  email: string
  role?: string
  profile?: UserProfile
  bpThresholds?: BPThresholds
  createdAt?: string
  updatedAt?: string
}

export interface UserFilters {
  page?: number
  limit?: number
  role?: string
  search?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

class UsersApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getItem("accessToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async getProfile(): Promise<User> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/profile`, { method: "GET", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<User> = await response.json()
    return data.data
  }

  async updateProfile(profile: UserProfile): Promise<User> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ profile }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<User> = await response.json()
    return data.data
  }

  async updateBPThresholds(thresholds: BPThresholds): Promise<User> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/bp-thresholds`, {
      method: "PUT",
      headers,
      body: JSON.stringify(thresholds),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<User> = await response.json()
    return data.data
  }

  async changePassword(payload: ChangePasswordPayload): Promise<User> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/change-password`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<User> = await response.json()
    return data.data
  }

  async deleteAccount(): Promise<void> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/account`, { method: "DELETE", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
  }

  async getAllUsers(filters?: UserFilters): Promise<User[]> {
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
    const data: any = await response.json()
    return data.data.users
  }

  async getUserById(id: string): Promise<User> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_URL}/users/${id}`, { method: "GET", headers })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    const data: ApiResponse<User> = await response.json()
    return data.data
  }
}

export const usersApi = new UsersApi()
