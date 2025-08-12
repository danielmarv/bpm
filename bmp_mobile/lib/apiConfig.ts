// API Configuration and Types
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    type: string
    message: string
    details?: any[]
    timestamp: string
    requestId: string
  }
}

export interface BloodPressureReading {
  _id: string
  userId: string
  systolic: number
  diastolic: number
  pulse: number
  timestamp: string
  isAbnormal: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface BloodPressureStats {
  averages: {
    systolic: number
    diastolic: number
    pulse: number
  }
  ranges: {
    systolic: { min: number; max: number }
    diastolic: { min: number; max: number }
  }
  totalReadings: number
  abnormalReadings: number
  trends: {
    systolic: "improving" | "stable" | "worsening"
    diastolic: "improving" | "stable" | "worsening"
  }
  period: string
}

export interface Medication {
  _id: string
  userId: string
  name: string
  dosage: string
  frequency: "once_daily" | "twice_daily" | "three_times_daily" | "four_times_daily" | "as_needed"
  startDate: string
  endDate?: string
  reminderSchedule: {
    times: string[]
    enabled: boolean
  }
  instructions?: string
  prescribedBy?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MedicationLog {
  _id: string
  medicationId: string
  userId: string
  dosageTaken: string
  takenAt: string
  notes?: string
  createdAt: string
}

export interface MedicationAdherence {
  medicationId: string
  medicationName: string
  adherenceRate: number
  totalDoses: number
  takenDoses: number
  missedDoses: number
  period: string
  lastTaken?: string
}

export interface Message {
  _id: string
  senderId: string
  receiverId: string
  subject: string
  body: string
  priority: "urgent" | "high" | "normal" | "low"
  isRead: boolean
  threadId?: string
  parentMessageId?: string
  createdAt: string
  updatedAt: string
  sender: {
    _id: string
    firstName: string
    lastName: string
    role: "patient" | "provider"
  }
  receiver: {
    _id: string
    firstName: string
    lastName: string
    role: "patient" | "provider"
  }
}

export interface Provider {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: "provider"
  specialization?: string
  licenseNumber?: string
  isActive: boolean
}

export interface User {
  _id: string
  email: string
  role: "patient" | "provider"
  firstName: string
  lastName: string
  profile: {
    dateOfBirth?: string
    gender?: "male" | "female" | "other"
    phone?: string
    address?: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    emergencyContact?: {
      name: string
      phone: string
      relationship: string
    }
    medicalHistory?: string[]
    allergies?: string[]
    currentMedications?: string[]
  }
  bpThresholds?: {
    systolicHigh: number
    systolicLow: number
    diastolicHigh: number
    diastolicLow: number
  }
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}
