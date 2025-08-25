import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const API_URL = "https://bpm-ctw9.onrender.com/api";

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
};

interface Message {
  _id?: string;
  senderId?: string;
  receiverId: string;
  subject: string;
  body: string;
  priority: "normal" | "high" | "low" | "urgent";
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface MessageFilters {
  type?: "inbox" | "sent";
  unread?: boolean;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class MessagesApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async sendMessage(
    message: Pick<Message, "receiverId" | "subject" | "body" | "priority">
  ): Promise<Message> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const responseData: ApiResponse<Message> = await response.json();
    return responseData.data;
  }

  async getMessages(filters?: MessageFilters): Promise<{ messages: Message[]; pagination: any }> {
    const headers = await this.getAuthHeaders();
    const queryParams = new URLSearchParams();

    if (filters) {
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.unread !== undefined) queryParams.append("unread", String(filters.unread));
      if (filters.page) queryParams.append("page", String(filters.page));
      if (filters.limit) queryParams.append("limit", String(filters.limit));
    }

    const url = `${API_URL}/messages${queryParams.toString() ? `?${queryParams}` : ""}`;
    const response = await fetch(url, { method: "GET", headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const responseData: ApiResponse<{ messages: Message[]; pagination: any }> = await response.json();
    return responseData.data;
  }

  async getMessageById(id: string): Promise<Message> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/messages/${id}`, { method: "GET", headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const responseData: ApiResponse<Message> = await response.json();
    return responseData.data;
  }

  async markAsRead(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/messages/${id}/read`, { method: "PUT", headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }

  async deleteMessage(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/messages/${id}`, { method: "DELETE", headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const messagesApi = new MessagesApi();
export type { Message, MessageFilters, ApiResponse };
