"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { BPEntryForm } from "@/components/dashboard/bp-entry-form"
import { BPStatsCard } from "@/components/dashboard/bp-stats-card"
import { BPHistory } from "@/components/dashboard/bp-history"
import { BPChart3D } from "@/components/dashboard/bp-chart-3d"
import { Medication3DChart } from "@/components/visualizations/medication-3d-chart"
import { Lifestyle3DSphere } from "@/components/visualizations/lifestyle-3d-sphere"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, LogOut, User, Pill, MessageSquare, Activity, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUnreadCount()
  }, [])

  const loadUnreadCount = async () => {
    try {
      // Mock unread count for now
      setUnreadCount(3)
    } catch (error) {
      console.error("Failed to load unread count:", error)
    }
  }

  const handleBPRecorded = () => {
    // Trigger refresh of stats and history
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-heading font-black text-slate-800">BP Manager</h1>
                  <p className="text-sm text-slate-600">
                    Welcome back, {user?.firstName} {user?.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/medications">
                    <Pill className="w-4 h-4 mr-2" />
                    Medications
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="relative bg-transparent">
                  <Link href="/messages">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/lifestyle">
                    <Activity className="w-4 h-4 mr-2" />
                    Lifestyle
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/education">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Education
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Top Row - Entry Form & Stats */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="space-y-8">
                <BPEntryForm onSuccess={handleBPRecorded} />
                <BPStatsCard key={refreshKey} />
              </div>
              <div className="lg:col-span-2">
                <BPChart3D key={refreshKey} />
              </div>
            </div>

            {/* Middle Row - 3D Visualizations */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Medication3DChart />
              <Lifestyle3DSphere />
            </div>

            {/* Bottom Row - History */}
            <div>
              <BPHistory key={refreshKey} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
