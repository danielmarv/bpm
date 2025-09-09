import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import type { Resource } from "../../services/resourcesApi"

interface ResourceCardProps {
  resource: Resource
  onPress?: (id: string) => void
}

const { width } = Dimensions.get("window")

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => onPress?.(resource._id!)}>
      <View style={styles.cardBackground}>
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {resource.title}
              </Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.category}>{resource.category}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.content} numberOfLines={3}>
            {resource.content}
          </Text>

          {resource.tags && resource.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {resource.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {resource.tags.length > 3 && (
                <View style={styles.moreTagsIndicator}>
                  <Text style={styles.moreTagsText}>+{resource.tags.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.accentLine} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    marginHorizontal: 2, // Added horizontal margin for shadow visibility
  },
  cardBackground: {
    backgroundColor: "#ffffff",
    borderRadius: 16, // Increased border radius for more modern look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, // Enhanced shadow
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  cardContent: {
    padding: 20, // Increased padding for better breathing room
  },
  header: {
    marginBottom: 12, // Increased margin for better spacing
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1f2937", // Slightly darker for better contrast
    lineHeight: 24, // Added line height for better readability
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    backgroundColor: "#ecfdf5", // Softer background color
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // More rounded badge
    borderWidth: 1,
    borderColor: "#a7f3d0", // Added subtle border
  },
  category: {
    fontSize: 11,
    fontFamily: "OpenSans-SemiBold", // Made semibold for better visibility
    color: "#047857", // Slightly darker green
    textTransform: "uppercase", // Added uppercase for badge style
    letterSpacing: 0.5,
  },
  content: {
    fontSize: 15, // Slightly larger for better readability
    fontFamily: "OpenSans-Regular",
    color: "#6b7280", // Better contrast
    lineHeight: 22, // Added line height
    marginBottom: 16, // Added margin for spacing
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tag: {
    backgroundColor: "#f0fdf4", // Softer tag background
    paddingHorizontal: 10, // Increased padding
    paddingVertical: 6,
    borderRadius: 8, // More rounded tags
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#bbf7d0", // Added subtle border
  },
  tagText: {
    color: "#166534", // Darker green for better contrast
    fontSize: 12,
    fontFamily: "OpenSans-Medium", // Medium weight
    letterSpacing: 0.2,
  },
  moreTagsIndicator: {
    backgroundColor: "#f3f4f6", // Added indicator for more tags
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  moreTagsText: {
    color: "#9ca3af",
    fontSize: 11,
    fontFamily: "OpenSans-Medium",
  },
  accentLine: {
    height: 3, // Added accent line at bottom
    backgroundColor: "#10b981",
    width: "30%",
  },
})
