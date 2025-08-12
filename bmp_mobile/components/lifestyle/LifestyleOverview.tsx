"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Activity, Apple, Scale, Target, TrendingUp } from "../ui/Icons"

interface LifestyleStats {
  exercise: {
    weeklyMinutes: number
    goal: number
    streak: number
  }
  diet: {
    dailyCalories: number
    goal: number
    sodium: number
  }
  weight: {
    current: number
    change: number
    trend: "up" | "down" | "stable"
  }
  overall: {
    score: number
    improvement: number
  }
}

interface LifestyleOverviewProps {
  onExercisePress: () => void
  onDietPress: () => void
  onWeightPress: () => void
  onSettingsPress: () => void
}

export function LifestyleOverview({ onExercisePress, onDietPress, onWeightPress }: LifestyleOverviewProps) {
  const [stats, setStats] = useState<LifestyleStats>({
    exercise: { weeklyMinutes: 180, goal: 150, streak: 5 },
    diet: { dailyCalories: 1850, goal: 2000, sodium: 1200 },
    weight: { current: 75.2, change: -0.8, trend: "down" },
    overall: { score: 85, improvement: 12 },
  })

  return (
    <View style={styles.container}>
      {/* Overall Health Score */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>Health Score</Text>
          <View style={styles.improvementBadge}>
            <TrendingUp size={16} color="#059669" />
            <Text style={styles.improvementText}>+{stats.overall.improvement}%</Text>
          </View>
        </View>
        <View style={styles.scoreContent}>
          <Text style={styles.scoreValue}>{stats.overall.score}</Text>
          <Text style={styles.scoreSubtext}>out of 100</Text>
        </View>
        <View style={styles.scoreBar}>
          <View style={[styles.scoreProgress, { width: `${stats.overall.score}%` }]} />
        </View>
      </View>

      {/* Lifestyle Categories */}
      <View style={styles.categoriesContainer}>
        {/* Exercise Card */}
        <TouchableOpacity style={styles.categoryCard} onPress={onExercisePress} activeOpacity={0.8}>
          <View style={[styles.categoryIcon, { backgroundColor: "#dbeafe" }]}>
            <Activity size={24} color="#2563eb" />
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>Exercise</Text>
            <Text style={styles.categoryValue}>{stats.exercise.weeklyMinutes} min</Text>
            <Text style={styles.categorySubtext}>This week • {stats.exercise.streak} day streak</Text>
          </View>
          <View style={styles.categoryProgress}>
            <View style={styles.progressRing}>
              <Text style={styles.progressText}>
                {Math.round((stats.exercise.weeklyMinutes / stats.exercise.goal) * 100)}%
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Diet Card */}
        <TouchableOpacity style={styles.categoryCard} onPress={onDietPress} activeOpacity={0.8}>
          <View style={[styles.categoryIcon, { backgroundColor: "#fef3e2" }]}>
            <Apple size={24} color="#d97706" />
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>Nutrition</Text>
            <Text style={styles.categoryValue}>{stats.diet.dailyCalories} cal</Text>
            <Text style={styles.categorySubtext}>Today • {stats.diet.sodium}mg sodium</Text>
          </View>
          <View style={styles.categoryProgress}>
            <View style={styles.progressRing}>
              <Text style={styles.progressText}>{Math.round((stats.diet.dailyCalories / stats.diet.goal) * 100)}%</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Weight Card */}
        <TouchableOpacity style={styles.categoryCard} onPress={onWeightPress} activeOpacity={0.8}>
          <View style={[styles.categoryIcon, { backgroundColor: "#f3e8ff" }]}>
            <Scale size={24} color="#7c3aed" />
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>Weight</Text>
            <Text style={styles.categoryValue}>{stats.weight.current} kg</Text>
            <Text style={[styles.categorySubtext, { color: stats.weight.change < 0 ? "#059669" : "#dc2626" }]}>
              {stats.weight.change > 0 ? "+" : ""}
              {stats.weight.change} kg this month
            </Text>
          </View>
          <View style={styles.categoryProgress}>
            <View style={[styles.trendIcon, { backgroundColor: stats.weight.change < 0 ? "#ecfdf5" : "#fef2f2" }]}>
              <TrendingUp
                size={20}
                color={stats.weight.change < 0 ? "#059669" : "#dc2626"}
                style={stats.weight.change < 0 ? {} : { transform: [{ rotate: "180deg" }] }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <Text style={styles.quickStatsTitle}>This Week</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Target size={20} color="#059669" />
            <Text style={styles.statValue}>4/7</Text>
            <Text style={styles.statLabel}>Goals Met</Text>
          </View>
          <View style={styles.statItem}>
            <Activity size={20} color="#2563eb" />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Apple size={20} color="#d97706" />
            <Text style={styles.statValue}>12.5k</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scoreCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  improvementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  improvementText: {
    fontSize: 12,
    fontFamily: "OpenSans-SemiBold",
    color: "#059669",
  },
  scoreContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: "Montserrat-Bold",
    color: "#059669",
  },
  scoreSubtext: {
    fontSize: 14,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  scoreBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreProgress: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 4,
  },
  categoriesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 4,
  },
  categoryValue: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  categorySubtext: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
  categoryProgress: {
    alignItems: "center",
  },
  progressRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    fontSize: 12,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
  },
  trendIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  quickStats: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  quickStatsTitle: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "OpenSans-Regular",
    color: "#64748b",
  },
})
