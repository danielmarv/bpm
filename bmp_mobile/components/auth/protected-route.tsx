"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2, Heart } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "patient" | "provider"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (!loading && user && requiredRole && user.role !== requiredRole) {
      router.push("/unauthorized")
    }
  }, [user, loading, router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#059669] rounded-full flex items-center justify-center animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#059669]" />
            <p className="text-[#475569] font-medium">Loading your health dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (requiredRole && user.role !== requiredRole) {
    return null // Will redirect to unauthorized
  }

  return <>{children}</>
}
