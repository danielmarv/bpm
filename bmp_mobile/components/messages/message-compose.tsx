"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, AlertTriangle, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type Provider } from "@/lib/api"

interface MessageComposeProps {
  onSuccess?: () => void
  onCancel?: () => void
  replyTo?: {
    messageId: string
    subject: string
    receiverId: string
    receiverName: string
  }
}

export function MessageCompose({ onSuccess, onCancel, replyTo }: MessageComposeProps) {
  const [formData, setFormData] = useState({
    receiverId: replyTo?.receiverId || "",
    subject: replyTo?.subject ? `Re: ${replyTo.subject}` : "",
    body: "",
    priority: "normal" as "urgent" | "high" | "normal" | "low",
  })
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProviders, setLoadingProviders] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === "patient") {
      loadProviders()
    } else {
      setLoadingProviders(false)
    }
  }, [user])

  const loadProviders = async () => {
    try {
      const response = await apiService.getProviders()
      setProviders(response.data)
    } catch (error) {
      console.error("Failed to load providers:", error)
    } finally {
      setLoadingProviders(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (replyTo) {
        await apiService.replyToMessage(replyTo.messageId, {
          body: formData.body,
          priority: formData.priority,
        })
        toast({
          title: "Reply sent",
          description: "Your reply has been sent successfully",
        })
      } else {
        await apiService.sendMessage(formData)
        toast({
          title: "Message sent",
          description: "Your message has been sent successfully",
        })
      }

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please check your input and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#059669] rounded-full flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="font-heading font-bold text-[#475569]">
              {replyTo ? "Reply to Message" : "Compose Message"}
            </CardTitle>
            <CardDescription className="text-[#475569]/70">
              {replyTo ? `Replying to ${replyTo.receiverName}` : "Send a message to your healthcare provider"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!replyTo && (
            <div className="space-y-2">
              <Label htmlFor="receiverId" className="text-[#475569] font-medium">
                {user?.role === "patient" ? "Healthcare Provider" : "Recipient"} *
              </Label>
              {loadingProviders ? (
                <div className="h-11 bg-gray-100 rounded animate-pulse"></div>
              ) : (
                <Select value={formData.receiverId} onValueChange={(value) => handleInputChange("receiverId", value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider._id} value={provider._id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>
                            Dr. {provider.firstName} {provider.lastName}
                          </span>
                          {provider.specialization && (
                            <span className="text-sm text-gray-500">({provider.specialization})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {!replyTo && (
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-[#475569] font-medium">
                Subject *
              </Label>
              <Input
                id="subject"
                placeholder="e.g., Blood pressure concerns, Medication side effects..."
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                required
                className="h-11"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-[#475569] font-medium">
              Priority
            </Label>
            <div className="flex items-center gap-4">
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger className="w-40 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Urgent
                    </div>
                  </SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Badge className={getPriorityColor(formData.priority)}>{formData.priority.toUpperCase()}</Badge>
            </div>
            {formData.priority === "urgent" && (
              <p className="text-sm text-red-600">
                Urgent messages will be prioritized and may trigger immediate notifications.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body" className="text-[#475569] font-medium">
              Message *
            </Label>
            <Textarea
              id="body"
              placeholder="Describe your concerns, symptoms, or questions in detail..."
              value={formData.body}
              onChange={(e) => handleInputChange("body", e.target.value)}
              required
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-[#475569]/60">
              Be specific about symptoms, timing, and any relevant details to help your provider assist you better.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 h-11 bg-[#059669] hover:bg-[#047857] text-white font-medium"
              disabled={isLoading || !formData.receiverId || !formData.body || (!replyTo && !formData.subject)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {replyTo ? "Send Reply" : "Send Message"}
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="h-11 bg-transparent">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
