"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"
import Constants from "expo-constants"

interface User {
  _id: string
  id: string
  email: string
  role: "patient" | "provider"
  profile: {
    firstName: string
    lastName: string
    dateOfBirth?: string
    gender?: string
    phone?: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  role: "patient" | "provider"
  firstName: string
  lastName: string
  phone?: string

}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = "https://bpm-ctw9.onrender.com/api" // Adjust based on your server setup

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key)
    }
    return await SecureStore.getItemAsync(key)
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value)
    } else {
      await SecureStore.setItemAsync(key, value)
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key)
    } else {
      await SecureStore.deleteItemAsync(key)
    }
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await storage.getItem("accessToken")
      const userData = await storage.getItem("userData")

      if (token && userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Error checking auth state:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Mock API call - replace with actual API
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const responseData = await response.json()

      await storage.setItem("accessToken", responseData.data.accessToken)
      await storage.setItem("refreshToken", responseData.data.refreshToken)
      await storage.setItem("userData", JSON.stringify(responseData.data.user))

      setUser(responseData.data.user)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true)

      // Mock API call - replace with actual API
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error("Registration failed")
      }

      const responseData = await response.json()

      await storage.setItem("accessToken", responseData.data.accessToken)
      await storage.setItem("refreshToken", responseData.data.refreshToken)
      await storage.setItem("userData", JSON.stringify(responseData.data.user))

      setUser(responseData.data.user)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await storage.removeItem("accessToken")
      await storage.removeItem("refreshToken")
      await storage.removeItem("userData")
      setUser(null)
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
