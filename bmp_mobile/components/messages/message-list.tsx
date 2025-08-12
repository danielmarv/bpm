"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Clock, User, AlertTriangle, Mail, MailOpen, Reply } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type Message } from "@/lib/api"
import { MessageCompose } from "./message-compose"
import { format } from "date-fns"

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [replyTo, setReplyTo] = useState<{
    messageId: string
    subject: string
    receiverId: string
    receiverName: string
  } | null>(null)
  const [filters, setFilters] = useState({
    type: "all" as "sent" | "received" | "all",
    unreadOnly: false,
    priority: "all" as "" | "urgent" | "high" | "normal" | "low",
  })
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadMessages()
  }, [filters])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const params = {
        ...filters,
        priority: filters.priority || undefined,
      }
      const response = await apiService.getMessages(params)
      setMessages(response.data.messages)
    } catch (error) {
      console.error("Failed to load messages:", error)
      toast({
        title: "Failed to load messages",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message)

    // Mark as read if it's unread and user is the receiver
    if (!message.isRead && message.receiverId === user?.id) {
      try {
        await apiService.markMessageAsRead(message._id)
        // Update local state
        setMessages((prev) => prev.map((m) => (m._id === message._id ? { ...m, isRead: true } : m)))
      } catch (error) {
        console.error("Failed to mark message as read:", error)
      }
    }
  }

  const handleReply = (message: Message) => {
    const isFromProvider = message.sender.role === "provider"
    const replyToId = isFromProvider ? message.senderId : message.receiverId
    const replyToName = isFromProvider
      ? `${message.sender.firstName} ${message.sender.lastName}`
      : `${message.receiver.firstName} ${message.receiver.lastName}`

    setReplyTo({
      messageId: message._id,
      subject: message.subject,
      receiverId: replyToId,
      receiverName: replyToName,
    })
    setSelectedMessage(null)
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

  const getPriorityIcon = (priority: string) => {
    if (priority === "urgent") {
      return <AlertTriangle className="w-3 h-3" />
    }
    return null
  }

  if (showCompose) {
    return (
      <MessageCompose
        onSuccess={() => {
          setShowCompose(false)
          loadMessages()
        }}
        onCancel={() => setShowCompose(false)}
      />
    )
  }

  if (replyTo) {
    return (
      <MessageCompose
        replyTo={replyTo}
        onSuccess={() => {
          setReplyTo(null)
          loadMessages()
        }}
        onCancel={() => setReplyTo(null)}
      />
    )
  }

  if (selectedMessage) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#059669] rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="font-heading font-bold text-[#475569]">{selectedMessage.subject}</CardTitle>
                <CardDescription className="text-[#475569]/70">
                  From: {selectedMessage.sender.firstName} {selectedMessage.sender.lastName} (
                  {selectedMessage.sender.role})
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleReply(selectedMessage)}
                size="sm"
                className="bg-[#059669] hover:bg-[#047857]"
              >
                <Reply className="w-4 h-4 mr-2" />
                Reply
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedMessage(null)}>
                Back to List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-[#475569]/70">
            <Badge className={getPriorityColor(selectedMessage.priority)}>
              {getPriorityIcon(selectedMessage.priority)}
              {selectedMessage.priority.toUpperCase()}
            </Badge>
            <span>{format(new Date(selectedMessage.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
          </div>

          <div className="bg-[#f1f5f9] rounded-lg p-4">
            <div className="whitespace-pre-wrap text-[#475569] leading-relaxed">{selectedMessage.body}</div>
          </div>

          {selectedMessage.replies && selectedMessage.replies.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-[#475569]">Replies</h3>
              {selectedMessage.replies.map((reply) => (
                <div key={reply._id} className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-[#475569]">
                      {reply.sender.firstName} {reply.sender.lastName} ({reply.sender.role})
                    </div>
                    <div className="text-xs text-[#475569]/70">
                      {format(new Date(reply.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                  <div className="text-[#475569] leading-relaxed">{reply.body}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#059669] rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="font-heading font-bold text-[#475569]">Messages</CardTitle>
              <CardDescription className="text-[#475569]/70">
                Communicate securely with your healthcare providers
              </CardDescription>
            </div>
          </div>
          <Button onClick={() => setShowCompose(true)} className="bg-[#059669] hover:bg-[#047857] text-white">
            <MessageSquare className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <Select value={filters.type} onValueChange={(value: any) => setFilters({ ...filters, type: value })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(value: any) => setFilters({ ...filters, priority: value })}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, unreadOnly: !filters.unreadOnly })}
            className={filters.unreadOnly ? "bg-blue-50 border-blue-200" : ""}
          >
            {filters.unreadOnly ? "Show All" : "Unread Only"}
          </Button>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-[#475569]/70">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No messages found</p>
              <Button variant="outline" className="mt-2 bg-transparent" onClick={() => setShowCompose(true)}>
                Send your first message
              </Button>
            </div>
          ) : (
            messages.map((message) => {
              const isFromUser = message.senderId === user?.id
              const otherPerson = isFromUser ? message.receiver : message.sender

              return (
                <div
                  key={message._id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-slate-50 ${
                    !message.isRead && !isFromUser ? "bg-blue-50 border-blue-200" : "bg-[#f1f5f9] border-slate-200"
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading font-bold text-[#475569]">{message.subject}</h3>
                          <Badge className={getPriorityColor(message.priority)}>
                            {getPriorityIcon(message.priority)}
                            {message.priority}
                          </Badge>
                          {!message.isRead && !isFromUser && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Mail className="w-3 h-3 mr-1" />
                              New
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-[#475569]/70">
                          <span>
                            {isFromUser ? "To" : "From"}: {otherPerson.firstName} {otherPerson.lastName} (
                            {otherPerson.role})
                          </span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{format(new Date(message.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>

                        <p className="text-sm text-[#475569]/60 mt-1 line-clamp-2">{message.body}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {message.isRead ? (
                        <MailOpen className="w-4 h-4 text-[#475569]/40" />
                      ) : (
                        <Mail className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
