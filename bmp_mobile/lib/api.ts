import {
  type ApiResponse,
  API_BASE_URL,
  type BloodPressureReading,
  type BloodPressureStats,
  type Medication,
  type MedicationLog,
  type MedicationAdherence,
  type Message,
  type Provider,
} from "./apiConfig"

interface ExerciseActivity {
  _id: string
  userId: string
  activity: string
  duration: number
  intensity: "low" | "moderate" | "high"
  caloriesBurned: number
  notes?: string
  createdAt: string
}

interface DietEntry {
  _id: string
  userId: string
  meal: "breakfast" | "lunch" | "dinner" | "snack"
  foods: Array<{
    name: string
    quantity: string
    calories: number
    sodium?: number
  }>
  totalCalories: number
  totalSodium: number
  notes?: string
  createdAt: string
}

interface WeightEntry {
  _id: string
  userId: string
  weight: number
  unit: "kg" | "lbs"
  bodyFat?: number
  notes?: string
  createdAt: string
}

interface StressEntry {
  _id: string
  userId: string
  level: number // 1-10 scale
  triggers?: string[]
  notes?: string
  createdAt: string
}

interface ActivitySummary {
  period: string
  exercise: {
    totalSessions: number
    totalDuration: number
    totalCalories: number
    averageIntensity: string
  }
  diet: {
    totalEntries: number
    averageCalories: number
    averageSodium: number
  }
  weight: {
    currentWeight: number
    weightChange: number
    trend: "gaining" | "losing" | "stable"
  }
  stress: {
    averageLevel: number
    trend: "improving" | "stable" | "worsening"
  }
}

interface EducationalResource {
  _id: string
  title: string
  category: "blood_pressure" | "medication" | "lifestyle" | "diet"
  type: "article" | "video" | "infographic"
  content: string
  summary: string
  readTime?: number
  videoUrl?: string
  imageUrl?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

class ApiService {
  // Added lifestyle tracking API methods
  async logExercise(data: {
    activity: string
    duration: number
    intensity: "low" | "moderate" | "high"
    caloriesBurned: number
    notes?: string
  }): Promise<ApiResponse<ExerciseActivity>> {
    const response = await fetch(`${API_BASE_URL}/activities/exercise`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  }

  async getExerciseActivities(params?: {
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ activities: ExerciseActivity[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${API_BASE_URL}/activities/exercise?${searchParams}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async logDiet(data: {
    meal: "breakfast" | "lunch" | "dinner" | "snack"
    foods: Array<{
      name: string
      quantity: string
      calories: number
      sodium?: number
    }>
    notes?: string
  }): Promise<ApiResponse<DietEntry>> {
    const totalCalories = data.foods.reduce((sum, food) => sum + food.calories, 0)
    const totalSodium = data.foods.reduce((sum, food) => sum + (food.sodium || 0), 0)

    const response = await fetch(`${API_BASE_URL}/activities/diet`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        ...data,
        totalCalories,
        totalSodium,
      }),
    })
    return this.handleResponse(response)
  }

  async getDietEntries(params?: {
    startDate?: string
    endDate?: string
    meal?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ entries: DietEntry[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${API_BASE_URL}/activities/diet?${searchParams}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async logWeight(data: {
    weight: number
    unit: "kg" | "lbs"
    bodyFat?: number
    notes?: string
  }): Promise<ApiResponse<WeightEntry>> {
    const response = await fetch(`${API_BASE_URL}/activities/weight`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  }

  async getWeightEntries(params?: {
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ entries: WeightEntry[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${API_BASE_URL}/activities/weight?${searchParams}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async logStress(data: {
    level: number
    triggers?: string[]
    notes?: string
  }): Promise<ApiResponse<StressEntry>> {
    const response = await fetch(`${API_BASE_URL}/activities/stress`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  }

  async getStressEntries(params?: {
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ entries: StressEntry[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${API_BASE_URL}/activities/stress?${searchParams}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async getActivitySummary(period: "week" | "month" | "quarter" = "month"): Promise<ApiResponse<ActivitySummary>> {
    const response = await fetch(`${API_BASE_URL}/activities/summary?period=${period}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async getEducationalResources(params?: {
    category?: string
    type?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ resources: EducationalResource[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${API_BASE_URL}/resources?${searchParams}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async getEducationalResource(id: string): Promise<ApiResponse<EducationalResource>> {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  private async getAuthHeaders(): Promise<{ [key: string]: string }> {
    // Placeholder for authentication headers logic
    return { Authorization: "Bearer token" }
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }
}

export const apiService = new ApiService()
export type {
  BloodPressureReading,
  BloodPressureStats,
  Medication,
  MedicationLog,
  MedicationAdherence,
  Message,
  Provider,
  ExerciseActivity,
  DietEntry,
  WeightEntry,
  StressEntry,
  ActivitySummary,
  EducationalResource,
}
