"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, BookOpen, Heart, Pill, Activity, Apple } from "lucide-react"
import { ResourceCard } from "@/components/education/resource-card"
import { ResourceDetail } from "@/components/education/resource-detail"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { EducationalResource } from "@/lib/api"

// Mock data for educational resources
const mockResources: EducationalResource[] = [
  {
    _id: "1",
    title: "Understanding Blood Pressure: The Complete Guide",
    category: "blood_pressure",
    type: "article",
    content: `
      <h2>What is Blood Pressure?</h2>
      <p>Blood pressure is the force of blood pushing against the walls of your arteries as your heart pumps blood. It's measured in millimeters of mercury (mmHg) and recorded as two numbers:</p>
      <ul>
        <li><strong>Systolic pressure</strong> (top number): The pressure when your heart beats</li>
        <li><strong>Diastolic pressure</strong> (bottom number): The pressure when your heart rests between beats</li>
      </ul>
      
      <h2>Blood Pressure Categories</h2>
      <p>The American Heart Association defines these categories:</p>
      <ul>
        <li><strong>Normal:</strong> Less than 120/80 mmHg</li>
        <li><strong>Elevated:</strong> 120-129 systolic and less than 80 diastolic</li>
        <li><strong>High Blood Pressure Stage 1:</strong> 130-139 systolic or 80-89 diastolic</li>
        <li><strong>High Blood Pressure Stage 2:</strong> 140/90 mmHg or higher</li>
        <li><strong>Hypertensive Crisis:</strong> Higher than 180/120 mmHg</li>
      </ul>
      
      <h2>Why Blood Pressure Matters</h2>
      <p>High blood pressure, also called hypertension, is often called the "silent killer" because it usually has no warning signs or symptoms. Over time, high blood pressure can damage your arteries, heart, brain, kidneys, and eyes.</p>
    `,
    summary:
      "Learn the fundamentals of blood pressure, including what the numbers mean, normal ranges, and why monitoring is crucial for your health.",
    readTime: 8,
    imageUrl: "/placeholder.svg?height=200&width=300",
    tags: ["hypertension", "monitoring", "health basics", "prevention"],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    _id: "2",
    title: "Medication Adherence: Tips for Success",
    category: "medication",
    type: "article",
    content: `
      <h2>Why Medication Adherence Matters</h2>
      <p>Taking your blood pressure medication as prescribed is crucial for managing your condition effectively. Poor adherence can lead to uncontrolled blood pressure and increased risk of complications.</p>
      
      <h2>Common Barriers to Adherence</h2>
      <ul>
        <li>Forgetting to take medication</li>
        <li>Side effects</li>
        <li>Cost concerns</li>
        <li>Complex dosing schedules</li>
        <li>Feeling better and thinking medication isn't needed</li>
      </ul>
      
      <h2>Strategies for Better Adherence</h2>
      <ul>
        <li><strong>Use pill organizers:</strong> Sort medications by day and time</li>
        <li><strong>Set reminders:</strong> Use phone alarms or medication apps</li>
        <li><strong>Link to daily habits:</strong> Take medication with meals or brushing teeth</li>
        <li><strong>Communicate with your doctor:</strong> Discuss side effects and concerns</li>
        <li><strong>Understand your medication:</strong> Know why you're taking it and how it helps</li>
      </ul>
    `,
    summary:
      "Discover practical strategies to improve medication adherence and get the most benefit from your blood pressure treatment.",
    readTime: 6,
    imageUrl: "/placeholder.svg?height=200&width=300",
    tags: ["adherence", "medication management", "tips", "treatment"],
    createdAt: "2024-01-14T14:30:00Z",
    updatedAt: "2024-01-14T14:30:00Z",
  },
  {
    _id: "3",
    title: "DASH Diet for Blood Pressure Control",
    category: "diet",
    type: "article",
    content: `
      <h2>What is the DASH Diet?</h2>
      <p>DASH stands for Dietary Approaches to Stop Hypertension. It's an eating plan designed to help treat or prevent high blood pressure. The DASH diet emphasizes foods that are rich in potassium, calcium, and magnesium.</p>
      
      <h2>DASH Diet Guidelines</h2>
      <ul>
        <li><strong>Vegetables:</strong> 4-5 servings per day</li>
        <li><strong>Fruits:</strong> 4-5 servings per day</li>
        <li><strong>Whole grains:</strong> 6-8 servings per day</li>
        <li><strong>Lean proteins:</strong> 6 or fewer servings per day</li>
        <li><strong>Low-fat dairy:</strong> 2-3 servings per day</li>
        <li><strong>Nuts and seeds:</strong> 4-5 servings per week</li>
      </ul>
      
      <h2>Foods to Limit</h2>
      <ul>
        <li>Sodium (less than 2,300mg per day, ideally 1,500mg)</li>
        <li>Saturated fats</li>
        <li>Added sugars</li>
        <li>Processed foods</li>
      </ul>
      
      <h2>Sample DASH Diet Day</h2>
      <p><strong>Breakfast:</strong> Oatmeal with berries and low-fat milk<br>
      <strong>Lunch:</strong> Grilled chicken salad with mixed vegetables<br>
      <strong>Dinner:</strong> Baked salmon with quinoa and steamed broccoli<br>
      <strong>Snacks:</strong> Apple with almonds, low-fat yogurt</p>
    `,
    summary:
      "Learn about the DASH diet, a scientifically-proven eating plan that can help lower blood pressure naturally.",
    readTime: 10,
    imageUrl: "/placeholder.svg?height=200&width=300",
    tags: ["DASH diet", "nutrition", "heart healthy", "meal planning"],
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
  },
  {
    _id: "4",
    title: "Exercise and Blood Pressure: Getting Started",
    category: "lifestyle",
    type: "video",
    content: `
      <h2>How Exercise Helps Blood Pressure</h2>
      <p>Regular physical activity makes your heart stronger. A stronger heart can pump more blood with less effort, reducing the force on your arteries and lowering blood pressure.</p>
      
      <h2>Types of Exercise</h2>
      <ul>
        <li><strong>Aerobic exercise:</strong> Walking, jogging, cycling, swimming</li>
        <li><strong>Strength training:</strong> Weight lifting, resistance bands</li>
        <li><strong>Flexibility exercises:</strong> Stretching, yoga</li>
      </ul>
      
      <h2>Getting Started Safely</h2>
      <ul>
        <li>Start slowly and gradually increase intensity</li>
        <li>Aim for at least 150 minutes of moderate exercise per week</li>
        <li>Check with your doctor before starting a new exercise program</li>
        <li>Monitor your blood pressure before and after exercise</li>
      </ul>
    `,
    summary:
      "Discover how regular exercise can help lower blood pressure and learn safe ways to start an exercise routine.",
    readTime: 12,
    videoUrl: "https://example.com/exercise-video",
    imageUrl: "/placeholder.svg?height=200&width=300",
    tags: ["exercise", "fitness", "heart health", "lifestyle"],
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
  },
]

export default function EducationPage() {
  const [resources, setResources] = useState<EducationalResource[]>(mockResources)
  const [filteredResources, setFilteredResources] = useState<EducationalResource[]>(mockResources)
  const [selectedResource, setSelectedResource] = useState<EducationalResource | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    let filtered = resources

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((resource) => resource.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setFilteredResources(filtered)
  }, [resources, activeCategory, searchQuery])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "blood_pressure":
        return <Heart className="h-4 w-4" />
      case "medication":
        return <Pill className="h-4 w-4" />
      case "lifestyle":
        return <Activity className="h-4 w-4" />
      case "diet":
        return <Apple className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getCategoryCount = (category: string) => {
    if (category === "all") return resources.length
    return resources.filter((r) => r.category === category).length
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Educational Resources</h1>
            <p className="text-slate-600">
              Learn about blood pressure management, medications, and healthy lifestyle choices
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                All ({getCategoryCount("all")})
              </TabsTrigger>
              <TabsTrigger value="blood_pressure" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                BP ({getCategoryCount("blood_pressure")})
              </TabsTrigger>
              <TabsTrigger value="medication" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Meds ({getCategoryCount("medication")})
              </TabsTrigger>
              <TabsTrigger value="lifestyle" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Lifestyle ({getCategoryCount("lifestyle")})
              </TabsTrigger>
              <TabsTrigger value="diet" className="flex items-center gap-2">
                <Apple className="h-4 w-4" />
                Diet ({getCategoryCount("diet")})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="mt-6">
              {filteredResources.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No resources found</h3>
                    <p className="text-slate-600 text-center">
                      {searchQuery
                        ? "Try adjusting your search terms or browse different categories."
                        : "No resources available in this category yet."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <ResourceCard key={resource._id} resource={resource} onView={setSelectedResource} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Resource Detail Modal */}
        <ResourceDetail
          resource={selectedResource}
          open={!!selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      </div>
    </ProtectedRoute>
  )
}
