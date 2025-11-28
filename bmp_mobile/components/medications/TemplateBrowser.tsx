"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"
import { TemplateCard } from "./TemplateCard"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { Search, Filter, X } from "../ui/Icons"
import { medicationTemplatesApi, MedicationTemplate, TemplateCategory } from "../../services/medicationTemplatesApi"

interface TemplateBrowserProps {
  onSelectTemplate: (template: MedicationTemplate) => void
  onBack: () => void
  userRole?: "patient" | "provider"
}

export function TemplateBrowser({ onSelectTemplate, onBack, userRole = "patient" }: TemplateBrowserProps) {
  const [templates, setTemplates] = useState<MedicationTemplate[]>([])
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  })

  useEffect(() => {
    loadCategories()
    loadTemplates()
  }, [selectedCategory, searchQuery])

  const loadCategories = async () => {
    try {
      const data = await medicationTemplatesApi.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const loadTemplates = async (page = 1) => {
    try {
      setLoading(true)
      const filters = {
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        page,
        limit: 20,
      }

      let data
      if (userRole === "provider") {
        data = await medicationTemplatesApi.getProviderTemplates(filters)
      } else {
        data = await medicationTemplatesApi.getAvailableTemplates(filters)
      }

      if (page === 1) {
        setTemplates(data.templates)
      } else {
        setTemplates(prev => [...prev, ...data.templates])
      }
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to load templates:", error)
      Alert.alert("Error", "Failed to load medication templates")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category)
    setPagination(prev => ({ ...prev, current: 1 }))
    setShowFilters(false)
  }

  const loadMoreTemplates = () => {
    if (pagination.current < pagination.pages && !loading) {
      loadTemplates(pagination.current + 1)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory(null)
    setShowFilters(false)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {userRole === "provider" ? "My Templates" : "Browse Templates"}
        </Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medications..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#94a3b8"
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? "#ffffff" : "#64748b"} />
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {(selectedCategory || searchQuery) && (
        <View style={styles.activeFilters}>
          {selectedCategory && (
            <TouchableOpacity 
              style={styles.filterChip}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={styles.filterChipText}>
                {categories.find(c => c.value === selectedCategory)?.label}
              </Text>
              <X size={14} color="#7c3aed" />
            </TouchableOpacity>
          )}
          {searchQuery && (
            <TouchableOpacity 
              style={styles.filterChip}
              onPress={() => setSearchQuery("")}
            >
              <Text style={styles.filterChipText}>"{searchQuery}"</Text>
              <X size={14} color="#7c3aed" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFilters}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Categories */}
      {showFilters && (
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity
              style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
              onPress={() => handleCategorySelect(null)}
            >
              <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[styles.categoryChip, selectedCategory === category.value && styles.categoryChipActive]}
                onPress={() => handleCategorySelect(category.value)}
              >
                <Text style={[
                  styles.categoryChipText, 
                  selectedCategory === category.value && styles.categoryChipTextActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {pagination.total} template{pagination.total !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Templates List */}
      <ScrollView 
        style={styles.templatesList}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
          const paddingToBottom = 20
          
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMoreTemplates()
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && templates.length === 0 ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
            <Text style={styles.loadingText}>Loading templates...</Text>
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No templates found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory || searchQuery 
                ? "Try adjusting your filters" 
                : "No medication templates are available at the moment"}
            </Text>
          </View>
        ) : (
          <>
            {templates.map((template) => (
              <TemplateCard
                key={template._id}
                template={template}
                onSelect={onSelectTemplate}
                showProvider={userRole === "patient"}
              />
            ))}
            
            {loading && templates.length > 0 && (
              <View style={styles.loadingMore}>
                <LoadingSpinner />
              </View>
            )}
            
            {pagination.current >= pagination.pages && templates.length > 0 && (
              <Text style={styles.endMessage}>You've reached the end!</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#1e293b",
  },
  filterButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  filterButtonActive: {
    backgroundColor: "#7c3aed",
  },
  activeFilters: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#7c3aed",
    marginRight: 4,
  },
  clearFilters: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#ef4444",
  },
  categoriesContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#7c3aed",
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: "OpenSans-SemiBold",
    color: "#64748b",
  },
  categoryChipTextActive: {
    color: "#ffffff",
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
  },
  resultsText: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  templatesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
    textAlign: "center",
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: "center",
  },
  endMessage: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#94a3b8",
    textAlign: "center",
    paddingVertical: 20,
  },
})