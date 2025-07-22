import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { DigestiveTip } from "../types";
import { digestiveTips, getRandomTip } from "../utils";

export default function DigestiveTips() {
  const [todaysTip, setTodaysTip] = useState<DigestiveTip>(digestiveTips[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [fadeAnim] = useState(new Animated.Value(0));

  const categories = [
    { key: "all", label: "All Tips", emoji: "🌟" },
    { key: "general", label: "General", emoji: "💚" },
    { key: "bloating", label: "Bloating", emoji: "🎈" },
    { key: "fried-food", label: "Fried Food", emoji: "🍟" },
    { key: "exam-stress", label: "Exam Stress", emoji: "📚" },
  ];

  useEffect(() => {
    // Set today's tip based on date to ensure consistency
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        86400000
    );
    const tipIndex = dayOfYear % digestiveTips.length;
    setTodaysTip(digestiveTips[tipIndex]);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getFilteredTips = () => {
    if (selectedCategory === "all") {
      return digestiveTips;
    }
    return digestiveTips.filter((tip) => tip.category === selectedCategory);
  };

  const getNewRandomTip = () => {
    const newTip = getRandomTip();
    setTodaysTip(newTip);

    // Reset and restart animation
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>What To Eat Today 🍽️</Text>

      {/* Today's Featured Tip */}
      <Animated.View style={[styles.featuredTip, { opacity: fadeAnim }]}>
        <View style={styles.featuredHeader}>
          <Text style={styles.featuredEmoji}>{todaysTip.emoji}</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={getNewRandomTip}
          >
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.featuredTitle}>{todaysTip.title}</Text>
        <Text style={styles.featuredDescription}>{todaysTip.description}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {categories.find((cat) => cat.key === todaysTip.category)?.label ||
              "General"}
          </Text>
        </View>
      </Animated.View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.activeCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.key && styles.activeCategoryText,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* All Tips */}
      <View style={styles.tipsGrid}>
        {getFilteredTips().map((tip) => (
          <View key={tip.id} style={styles.tipCard}>
            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDescription}>{tip.description}</Text>
            <View style={styles.tipCategoryBadge}>
              <Text style={styles.tipCategoryText}>
                {categories.find((cat) => cat.key === tip.category)?.label ||
                  "General"}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Hostel-Specific Section */}
      <View style={styles.hostelSection}>
        <Text style={styles.hostelTitle}>🏠 Hostel Life Hacks</Text>
        <View style={styles.hackCard}>
          <Text style={styles.hackEmoji}>🥤</Text>
          <Text style={styles.hackText}>
            Keep a water bottle by your bed - hydrate first thing in the
            morning!
          </Text>
        </View>
        <View style={styles.hackCard}>
          <Text style={styles.hackEmoji}>🍌</Text>
          <Text style={styles.hackText}>
            Stock bananas in your room - perfect for late-night hunger pangs
          </Text>
        </View>
        <View style={styles.hackCard}>
          <Text style={styles.hackEmoji}>🌿</Text>
          <Text style={styles.hackText}>
            Keep fennel seeds (saunf) handy - natural breath freshener after
            meals
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffbf0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  featuredTip: {
    backgroundColor: "white",
    margin: 20,
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  featuredEmoji: {
    fontSize: 48,
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 24,
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 10,
  },
  featuredDescription: {
    fontSize: 16,
    color: "#4a5568",
    lineHeight: 24,
    marginBottom: 15,
  },
  categoryBadge: {
    backgroundColor: "#fed7d7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  categoryBadgeText: {
    fontSize: 12,
    color: "#c53030",
    fontWeight: "600",
  },
  categoryFilter: {
    marginBottom: 20,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeCategoryButton: {
    backgroundColor: "#f7fafc",
    borderWidth: 2,
    borderColor: "#667eea",
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: "#4a5568",
    fontWeight: "500",
  },
  activeCategoryText: {
    color: "#667eea",
    fontWeight: "600",
  },
  tipsGrid: {
    paddingHorizontal: 20,
  },
  tipCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tipEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 20,
    marginBottom: 12,
  },
  tipCategoryBadge: {
    backgroundColor: "#e6fffa",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  tipCategoryText: {
    fontSize: 11,
    color: "#319795",
    fontWeight: "600",
  },
  hostelSection: {
    margin: 20,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  hostelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 15,
  },
  hackCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f7fafc",
    borderRadius: 10,
  },
  hackEmoji: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  hackText: {
    flex: 1,
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 20,
  },
});
