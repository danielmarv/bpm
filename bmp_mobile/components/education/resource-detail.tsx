import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Play, FileText, ImageIcon, ExternalLink } from "lucide-react"
import type { EducationalResource } from "@/lib/api"

interface ResourceDetailProps {
  resource: EducationalResource | null
  open: boolean
  onClose: () => void
}

export function ResourceDetail({ resource, open, onClose }: ResourceDetailProps) {
  if (!resource) return null

  const getTypeIcon = () => {
    switch (resource.type) {
      case "video":
        return <Play className="h-5 w-5" />
      case "article":
        return <FileText className="h-5 w-5" />
      case "infographic":
        return <ImageIcon className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">{resource.title}</DialogTitle>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getCategoryColor()}>{resource.category.replace("_", " ")}</Badge>
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  {getTypeIcon()}
                  <span className="capitalize">{resource.type}</span>
                </div>
                {resource.readTime && (
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>{resource.readTime} min read</span>
                  </div>
                )}
              </div>
            </div>
            {resource.imageUrl && (
              <img
                src={resource.imageUrl || "/placeholder.svg"}
                alt={resource.title}
                className="w-32 h-32 rounded-lg object-cover"
              />
            )}
          </div>
        </DialogHeader>

        <div className="mt-6">
          {resource.type === "video" && resource.videoUrl && (
            <div className="mb-6">
              <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 mb-4">Video content would be embedded here</p>
                  <Button asChild>
                    <a href={resource.videoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Watch on External Platform
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="prose prose-slate max-w-none">
            <div className="text-lg text-slate-700 mb-6 font-medium">{resource.summary}</div>

            <div className="text-slate-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: resource.content }} />
          </div>

          {resource.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
