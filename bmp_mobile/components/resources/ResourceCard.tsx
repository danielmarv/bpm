// components/resources/ResourceCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Resource } from "../../services/resourcesApi";

interface ResourceCardProps {
  resource: Resource;
  onPress?: (id: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress?.(resource._id!)}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{resource.title}</Text>
        <Text style={styles.category}>{resource.category}</Text>
      </View>
      <Text style={styles.content} numberOfLines={3}>
        {resource.content}
      </Text>
      {resource.tags && (
        <View style={styles.tagsContainer}>
          {resource.tags.map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#111827",
  },
  category: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#059669",
    marginTop: 2,
  },
  content: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#4b5563",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: "#059669",
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
  },
});
