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

/**
 * Types
 */
export interface Resource {
  _id?: string;
  title: string;
  content: string;
  category: "hypertension" | "diet" | "exercise" | "medication" | "lifestyle" | "general";
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Assignment {
  _id?: string;
  resourceId: string;
  patientId: string;
  providerId?: string;
  notes?: string;
  priority?: "low" | "medium" | "high";
  status?: "assigned" | "viewed" | "completed";
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AssignmentFilters {
  patientId?: string;
  status?: "assigned" | "viewed" | "completed";
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Service
 */
class ResourceService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Create new resource (Admin/Provider only)
   */
  async createResource(resource: Pick<Resource, "title" | "content" | "category" | "tags">): Promise<Resource> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/resources`, {
      method: "POST",
      headers,
      body: JSON.stringify(resource),
    });
    const data: ApiResponse<Resource> = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Get resources (public + authenticated)
   */
  async getResources(filters?: ResourceFilters): Promise<{ resources: Resource[]; pagination: Pagination }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.page) queryParams.append("page", String(filters.page));
      if (filters.limit) queryParams.append("limit", String(filters.limit));
    }

    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/resources?${queryParams}`, {
      method: "GET",
      headers,
    });
    const data: ApiResponse<{ resources: Resource[]; pagination: Pagination }> = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Get a single resource by ID
   */
  async getResourceById(id: string): Promise<Resource> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/resources/${id}`, {
      method: "GET",
      headers,
    });
    const data: ApiResponse<Resource> = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Update resource (Admin/Provider only)
   */
  async updateResource(
    id: string,
    updates: Partial<Pick<Resource, "title" | "content" | "category" | "tags">>
  ): Promise<Resource> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/resources/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
    const data: ApiResponse<Resource> = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Delete resource (Admin/Provider only)
   */
  async deleteResource(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/resources/${id}`, {
      method: "DELETE",
      headers,
    });
    await this.handleResponse(response);
  }

  /**
   * Get resource categories
   */
  async getResourceCategories(): Promise<string[]> {
    const response = await fetch(`${API_URL}/resources/categories`, {
      method: "GET",
    });
    const data: ApiResponse<string[]> = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Assign a resource to a patient (Provider only)
   */
  async assignResourceToPatient(
    resourceId: string,
    patientId: string,
    assignmentData?: Pick<Assignment, "notes" | "priority" | "dueDate">
  ): Promise<Assignment> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/resources/assign/${resourceId}/${patientId}`, {
      method: "POST",
      headers,
      body: JSON.stringify(assignmentData || {}),
    });
    const data: ApiResponse<Assignment> = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Get resources assigned to the current patient
   */
  async getMyAssignedResources(filters?: AssignmentFilters): Promise<{ assignments: Assignment[]; pagination: Pagination }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.page) queryParams.append("page", String(filters.page));
      if (filters.limit) queryParams.append("limit", String(filters.limit));
    }

    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/resources/my-assigned?${queryParams}`, {
      method: "GET",
      headers,
    });
    const data: ApiResponse<{ assignments: Assignment[]; pagination: Pagination }> = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Get resource assignments made by the current provider
   */
  async getMyResourceAssignments(filters?: AssignmentFilters): Promise<{ assignments: Assignment[]; pagination: Pagination }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.patientId) queryParams.append("patientId", filters.patientId);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.page) queryParams.append("page", String(filters.page));
      if (filters.limit) queryParams.append("limit", String(filters.limit));
    }

    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/resources/my-assignments?${queryParams}`, {
      method: "GET",
      headers,
    });
    const data: ApiResponse<{ assignments: Assignment[]; pagination: Pagination }> = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Update assignment status (Patient only)
   */
  async updateAssignmentStatus(assignmentId: string, status: "assigned" | "viewed" | "completed"): Promise<Assignment> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/resources/assignment/${assignmentId}/status`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status }),
    });
    const data: ApiResponse<Assignment> = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Remove assignment (Provider only)
   */
  async removeAssignment(assignmentId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/resources/assignment/${assignmentId}`, {
      method: "DELETE",
      headers,
    });
    await this.handleResponse(response);
  }
}

export const resourceService = new ResourceService();
