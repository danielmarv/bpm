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

interface Message {
  _id?: string
  senderId?: string
  receiverId: string
  subject: string
  body: string
  priority: "normal" | "high" | "low"
  read?: boolean
  createdAt?: string
  updatedAt?: string
}

interface MessageFilters {
  type?: "inbox" | "sent"
  unread?: boolean
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

class MessagesApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getItem("accessToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async sendMessage(
    message: Pick<Message, "receiverId" | "subject" | "body" | "priority">
  ): Promise<Message> {
    try {
      const headers = await this.getAuthHeaders()

      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const responseData: ApiResponse<Message> = await response.json()
      return responseData.data
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  async getMessages(filters?: MessageFilters): Promise<Message[]> {
    try {
      const headers = await this.getAuthHeaders()

      const queryParams = new URLSearchParams()
      if (filters?.type) queryParams.append("type", filters.type)
      if (filters?.unread !== undefined)
        queryParams.append("unread", filters.unread.toString())

      const queryString = queryParams.toString()
      const url = `${API_URL}/messages${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const responseData: ApiResponse<Message[]> = await response.json()
      return responseData.data
    } catch (error) {
      console.error("Error fetching messages:", error)
      throw error
    }
  }

  async getMessageById(id: string): Promise<Message> {
    try {
      const headers = await this.getAuthHeaders()

      const response = await fetch(`${API_URL}/messages/${id}`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const responseData: ApiResponse<Message> = await response.json()
      return responseData.data
    } catch (error) {
      console.error("Error fetching message by ID:", error)
      throw error
    }
  }

  async markAsRead(id: string): Promise<Message> {
    try {
      const headers = await this.getAuthHeaders()

      const response = await fetch(`${API_URL}/messages/${id}/read`, {
        method: "PATCH",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const responseData: ApiResponse<Message> = await response.json()
      return responseData.data
    } catch (error) {
      console.error("Error marking message as read:", error)
      throw error
    }
  }

  async deleteMessage(id: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders()

      const response = await fetch(`${API_URL}/messages/${id}`, {
        method: "DELETE",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      throw error
    }
  }
}

export const messagesApi = new MessagesApi()

export type { Message, MessageFilters, ApiResponse }
