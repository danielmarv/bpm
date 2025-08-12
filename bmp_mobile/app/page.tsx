"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Activity, Shield, Users, BarChart3, Pill, MessageSquare, BookOpen } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center gap-3 text-slate-700">
          <Heart className="w-6 h-6 animate-pulse text-emerald-600" />
          <span className="font-medium">Loading BP Manager...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-heading font-black text-slate-800 leading-tight">
              Take Control of Your
              <span className="text-emerald-600"> Blood Pressure</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Professional blood pressure management with stunning 3D visualizations, medication tracking, lifestyle
              monitoring, and secure provider communication. Your health journey, beautifully simplified.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 shadow-lg">
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white bg-transparent"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-white to-emerald-50 hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="font-heading font-bold text-slate-800">3D Visualizations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Interactive 3D charts, rotating health spheres, and immersive trend analysis make your data come alive.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="font-heading font-bold text-slate-800">Smart Medication</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Advanced adherence tracking with 3D cylindrical charts and intelligent reminder systems.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-white to-purple-50 hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="font-heading font-bold text-slate-800">Provider Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Secure messaging with priority levels and threaded conversations for seamless healthcare communication.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-white to-amber-50 hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="font-heading font-bold text-slate-800">Health Education</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Comprehensive educational resources with articles, videos, and interactive content for better health.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="text-center border-0 shadow-lg bg-white">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="font-heading font-bold text-slate-800">Lifestyle Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Monitor exercise, diet, weight, and stress with beautiful 3D health sphere visualizations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="font-heading font-bold text-slate-800">Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                HIPAA-compliant security with enterprise-grade encryption protects your sensitive health data.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="font-heading font-bold text-slate-800">Care Team Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Share data seamlessly with your healthcare providers and receive personalized guidance and support.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-8 shadow-2xl max-w-3xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-white mb-4">
              Ready to Transform Your Health Management?
            </h2>
            <p className="text-emerald-100 text-lg mb-6">
              Join thousands of users who have taken control of their blood pressure with our innovative 3D platform.
            </p>
            <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 h-12 px-8 shadow-lg">
              <Link href="/register">Start Your Journey Today</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
