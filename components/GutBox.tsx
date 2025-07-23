import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { GutBoxItem } from "../types";
import { gutBoxItems, storeData, getData } from "../utils";
import { useTheme } from "../contexts/ThemeContext";

export default function GutBox() {
  const { theme } = useTheme();
  const [items, setItems] = useState<GutBoxItem[]>([]);
  const [availableCount, setAvailableCount] = useState(0);

  useEffect(() => {
    loadGutBoxData();
  }, []);

  const loadGutBoxData = async () => {
    try {
      const savedItems = await getData("gutBoxItems");

      if (savedItems && savedItems.length > 0) {
        setItems(savedItems);
        const available = savedItems.filter(
          (item: GutBoxItem) => item.isAvailable
        ).length;
        setAvailableCount(available);
      } else {
        // Initialize with default items
        const initialItems = gutBoxItems.map((item) => ({
          ...item,
          isAvailable: false,
        }));
        setItems(initialItems);
        setAvailableCount(0);
        await storeData("gutBoxItems", initialItems);
      }
    } catch (error) {
      console.error("Error loading gut box data:", error);
    }
  };

  const toggleItem = async (itemId: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, isAvailable: !item.isAvailable };
      }
      return item;
    });

    setItems(updatedItems);

    const available = updatedItems.filter((item) => item.isAvailable).length;
    setAvailableCount(available);

    try {
      await storeData("gutBoxItems", updatedItems);

      // Show motivational message
      const toggledItem = updatedItems.find((item) => item.id === itemId);
      if (toggledItem?.isAvailable) {
        const messages = [
          `Great! ${toggledItem.name} is ready to help your gut! 🌟`,
          `Smart choice! ${toggledItem.name} is now in your arsenal! 💪`,
          `Your gut box is getting stronger! 📦✨`,
          `Excellent! Your digestive toolkit is growing! 🛠️`,
        ];
        const randomMessage =
          messages[Math.floor(Math.random() * messages.length)];

        // Don't show alert for every toggle to avoid spam
        if (Math.random() > 0.7) {
          // 30% chance to show message
          Alert.alert("Nice! 🎉", randomMessage);
        }
      }
    } catch (error) {
      console.error("Error saving gut box data:", error);
    }
  };

  const getCompletionPercentage = () => {
    return Math.round((availableCount / items.length) * 100);
  };

  const getMotivationalMessage = () => {
    const percentage = getCompletionPercentage();

    if (percentage === 100)
      return "Gut box master! You're prepared for anything! 🏆";
    if (percentage >= 80)
      return "Almost complete! Your gut is well-protected! 🛡️";
    if (percentage >= 60) return "Great collection! You're gut-ready! 💪";
    if (percentage >= 40) return "Good progress! Building your gut arsenal! 🔧";
    if (percentage >= 20) return "Nice start! Keep stocking up! 📦";
    return "Time to build your gut survival kit! 🎒";
  };

  const resetAllItems = () => {
    Alert.alert(
      "Reset Gut Box?",
      "This will mark all items as unavailable. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            const resetItems = items.map((item) => ({
              ...item,
              isAvailable: false,
            }));
            setItems(resetItems);
            setAvailableCount(0);
            await storeData("gutBoxItems", resetItems);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.text }]}>Gut Box Checklist 📦</Text>

      {/* Progress Section */}
      <View style={[styles.progressSection, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
        <Text style={[styles.progressText, { color: theme.text }]}>
          {availableCount}/{items.length} items ready
        </Text>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${getCompletionPercentage()}%`, backgroundColor: theme.primary },
            ]}
          />
        </View>
        <Text style={[styles.motivationalText, { color: theme.textSecondary }]}>{getMotivationalMessage()}</Text>
      </View>

      {/* Instructions */}
      <View style={[styles.instructionsCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
        <Text style={[styles.instructionsTitle, { color: theme.text }]}>🎯 How it works</Text>
        <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
          Tap items you have in your hostel room or locker. Build your digestive
          emergency kit!
        </Text>
      </View>

      {/* Items Grid */}
      <View style={styles.itemsContainer}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.itemCard,
              { backgroundColor: theme.surface, shadowColor: theme.shadow },
              item.isAvailable && { backgroundColor: theme.successLight },
            ]}
            onPress={() => toggleItem(item.id)}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <View style={styles.checkboxContainer}>
                <Text style={styles.checkbox}>
                  {item.isAvailable ? "✅" : "⬜"}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.itemName,
                { color: theme.text },
                item.isAvailable && styles.availableItemName,
              ]}
            >
              {item.name}
            </Text>
            <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>{item.description}</Text>
            <View
              style={[
                styles.statusBadge,
                item.isAvailable
                  ? { backgroundColor: theme.success }
                  : { backgroundColor: theme.border },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.isAvailable
                    ? { color: theme.buttonText }
                    : { color: theme.textSecondary },
                ]}
              >
                {item.isAvailable ? "In Stock" : "Need to Get"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Shopping Tips */}
      <View style={[styles.tipsSection, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
        <Text style={[styles.tipsTitle, { color: theme.text }]}>🛍️ Shopping Tips</Text>
        <View style={[styles.tipCard, { backgroundColor: theme.background }]}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            Most items are available at local grocery stores or medical shops
          </Text>
        </View>
        <View style={[styles.tipCard, { backgroundColor: theme.background }]}>
          <Text style={styles.tipEmoji}>💰</Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            Buy in small quantities - they last long and don't take much space
          </Text>
        </View>
        <View style={[styles.tipCard, { backgroundColor: theme.background }]}>
          <Text style={styles.tipEmoji}>📦</Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            Store in airtight containers to keep them fresh
          </Text>
        </View>
      </View>

      {/* Usage Guide */}
      <View style={[styles.usageSection, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
        <Text style={[styles.usageTitle, { color: theme.text }]}>📋 Quick Usage Guide</Text>
        <View style={[styles.usageItem, { borderBottomColor: theme.border }]}>
          <Text style={styles.usageEmoji}>🌾</Text>
          <View style={styles.usageContent}>
            <Text style={[styles.usageName, { color: theme.text }]}>Jeera Water</Text>
            <Text style={[styles.usageText, { color: theme.textSecondary }]}>
              Soak 1 tsp in water overnight, drink in morning
            </Text>
          </View>
        </View>
        <View style={[styles.usageItem, { borderBottomColor: theme.border }]}>
          <Text style={styles.usageEmoji}>🌿</Text>
          <View style={styles.usageContent}>
            <Text style={[styles.usageName, { color: theme.text }]}>Saunf</Text>
            <Text style={[styles.usageText, { color: theme.textSecondary }]}>
              Keep fennel seeds (saunf) handy - natural breath freshener after
              meals
            </Text>
          </View>
        </View>
        <View style={[styles.usageItem, { borderBottomColor: theme.border }]}>
          <Text style={styles.usageEmoji}>🌱</Text>
          <View style={styles.usageContent}>
            <Text style={[styles.usageName, { color: theme.text }]}>Ajwain</Text>
            <Text style={[styles.usageText, { color: theme.textSecondary }]}>
              Chew 1/4 tsp with warm water for acidity
            </Text>
          </View>
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={[styles.resetButton, { backgroundColor: theme.danger }]} onPress={resetAllItems}>
        <Text style={[styles.resetButtonText, { color: theme.buttonText }]}>🔄 Reset All Items</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef5e7",
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
  progressSection: {
    backgroundColor: "white",
    margin: 20,
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#d69e2e",
    marginBottom: 15,
  },
  progressBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 15,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#d69e2e",
    borderRadius: 6,
  },
  motivationalText: {
    fontSize: 16,
    color: "#d69e2e",
    fontWeight: "600",
    textAlign: "center",
  },
  instructionsCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 20,
  },
  itemsContainer: {
    paddingHorizontal: 20,
  },
  itemCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  availableItemCard: {
    borderColor: "#48bb78",
    backgroundColor: "#f0fff4",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemEmoji: {
    fontSize: 32,
  },
  checkboxContainer: {
    alignItems: "center",
  },
  checkbox: {
    fontSize: 24,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 8,
  },
  availableItemName: {
    color: "#38a169",
  },
  itemDescription: {
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 20,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  availableBadge: {
    backgroundColor: "#c6f6d5",
  },
  unavailableBadge: {
    backgroundColor: "#fed7d7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  availableStatusText: {
    color: "#38a169",
  },
  unavailableStatusText: {
    color: "#e53e3e",
  },
  tipsSection: {
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
  tipsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 15,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#fffbf0",
    borderRadius: 10,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 20,
  },
  usageSection: {
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
  usageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 15,
  },
  usageItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#f7fafc",
    borderRadius: 10,
  },
  usageEmoji: {
    fontSize: 24,
    marginRight: 15,
    marginTop: 2,
  },
  usageContent: {
    flex: 1,
  },
  usageName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 4,
  },
  usageText: {
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 18,
  },
  resetButton: {
    backgroundColor: "#e2e8f0",
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    color: "#4a5568",
    fontWeight: "600",
  },
});
