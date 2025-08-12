"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Play, FileText, ImageIcon } from "lucide-react"
import type { EducationalResource } from "@/lib/api"

interface ResourceCardProps {
  resource: EducationalResource
  onView: (resource: EducationalResource) => void
}

export function ResourceCard({ resource, onView }: ResourceCardProps) {
  const getTypeIcon = () => {
    switch (resource.type) {
      case "video":
        return <Play className="h-4 w-4" />
      case "article":
        return <FileText className="h-4 w-4" />
      case "infographic":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = () => {
    switch (resource.category) {
      case "blood_pressure":
        return "bg-red-100 text-red-800"
      case "medication":
        return "bg-blue-100 text-blue-800"
      case "lifestyle":
        return "bg-green-100 text-green-800"
      case "diet":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900 line-clamp-2">{resource.title}</CardTitle>
            <CardDescription className="mt-2 line-clamp-3">{resource.summary}</CardDescription>
          </div>
          {resource.imageUrl && (
            <img
              src={resource.imageUrl || "/placeholder.svg"}
              alt={resource.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getCategoryColor()}>
              {resource.category.replace("_", " ")}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              {getTypeIcon()}
              <span className="capitalize">{resource.type}</span>
            </div>
          </div>
          {resource.readTime && (
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <Clock className="h-3 w-3" />
              <span>{resource.readTime} min</span>
            </div>
          )}
        </div>

        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <Button onClick={() => onView(resource)} className="w-full bg-emerald-600 hover:bg-emerald-700">
          {resource.type === "video" ? "Watch Video" : "Read More"}
        </Button>
      </CardContent>
    </Card>
  )
}
