"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { ExerciseForm } from "@/components/lifestyle/exercise-form"
import { DietForm } from "@/components/lifestyle/diet-form"
import { WeightForm } from "@/components/lifestyle/weight-form"
import { ActivitySummaryCard } from "@/components/lifestyle/activity-summary"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, ArrowLeft, Activity, Utensils, Scale, Brain } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function LifestylePage() {
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleActivityLogged = () => {
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
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                <div className="w-10 h-10 bg-[#059669] rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-heading font-black text-[#475569]">Lifestyle Tracking</h1>
                  <p className="text-sm text-[#475569]/70">Monitor your exercise, diet, weight, and wellness</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Left Column - Activity Summary */}
            <div>
              <ActivitySummaryCard key={refreshKey} />
            </div>

            {/* Right Column - Activity Forms */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="exercise" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="exercise" className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Exercise
                  </TabsTrigger>
                  <TabsTrigger value="diet" className="flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Diet
                  </TabsTrigger>
                  <TabsTrigger value="weight" className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Weight
                  </TabsTrigger>
                  <TabsTrigger value="stress" className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Stress
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="exercise">
                  <ExerciseForm onSuccess={handleActivityLogged} />
                </TabsContent>

                <TabsContent value="diet">
                  <DietForm onSuccess={handleActivityLogged} />
                </TabsContent>

                <TabsContent value="weight">
                  <WeightForm onSuccess={handleActivityLogged} />
                </TabsContent>

                <TabsContent value="stress">
                  <div className="text-center py-8 text-[#475569]/70">
                    <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Stress tracking form coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
