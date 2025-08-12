"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { MessageList } from "@/components/messages/message-list"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function MessagesPage() {
  const { user } = useAuth()

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
                  <h1 className="text-xl font-heading font-black text-[#475569]">Provider Messages</h1>
                  <p className="text-sm text-[#475569]/70">Secure communication with your healthcare team</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <MessageList />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
