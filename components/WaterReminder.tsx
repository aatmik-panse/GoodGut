import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { storeData, getData, getRandomWaterReminder } from "../utils";
import { useTheme } from "../contexts/ThemeContext";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function WaterReminder() {
  const { theme } = useTheme();
  const [waterCount, setWaterCount] = useState(0);
  const [dailyGoal] = useState(8); // 8 glasses per day
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTimes, setReminderTimes] = useState([
    "09:00",
    "11:00",
    "13:00",
    "15:00",
    "17:00",
    "19:00",
    "21:00",
  ]);

  useEffect(() => {
    loadWaterData();
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (remindersEnabled) {
      scheduleNotifications();
    } else {
      cancelNotifications();
    }
  }, [remindersEnabled, reminderTimes]);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Notifications Disabled",
        "Enable notifications to get water reminders!"
      );
    }
  };

  const loadWaterData = async () => {
    try {
      const today = new Date().toDateString();
      const savedData = await getData(`waterData_${today}`);
      const savedSettings = await getData("waterSettings");

      if (savedData) {
        setWaterCount(savedData.count || 0);
      }

      if (savedSettings) {
        setRemindersEnabled(savedSettings.enabled || false);
        setReminderTimes(savedSettings.times || reminderTimes);
      }
    } catch (error) {
      console.error("Error loading water data:", error);
    }
  };

  const saveWaterData = async (count: number) => {
    try {
      const today = new Date().toDateString();
      await storeData(`waterData_${today}`, { count, date: today });
    } catch (error) {
      console.error("Error saving water data:", error);
    }
  };

  const saveSettings = async (enabled: boolean, times: string[]) => {
    try {
      await storeData("waterSettings", { enabled, times });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const addWater = () => {
    const newCount = Math.min(waterCount + 1, dailyGoal);
    setWaterCount(newCount);
    saveWaterData(newCount);

    if (newCount === dailyGoal) {
      Alert.alert(
        "🎉 Goal Achieved!",
        "Amazing! You've reached your daily water goal. Your gut is happy! 💧"
      );
    }
  };

  const removeWater = () => {
    const newCount = Math.max(waterCount - 1, 0);
    setWaterCount(newCount);
    saveWaterData(newCount);
  };

  const scheduleNotifications = async () => {
    await cancelNotifications();

    for (const time of reminderTimes) {
      const [hours, minutes] = time.split(":").map(Number);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Hydration Time! 💧",
          body: getRandomWaterReminder(),
          sound: true,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
    }
  };

  const cancelNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const toggleReminders = (value: boolean) => {
    setRemindersEnabled(value);
    saveSettings(value, reminderTimes);
  };

  const getProgressPercentage = () => {
    return (waterCount / dailyGoal) * 100;
  };

  const getMotivationalMessage = () => {
    const percentage = getProgressPercentage();

    if (percentage === 100) return "Perfect hydration! 🏆";
    if (percentage >= 75) return "Almost there! 💪";
    if (percentage >= 50) return "Great progress! 🌟";
    if (percentage >= 25) return "Keep it up! 💧";
    return "Let's start hydrating! 🚰";
  };

  const getHydrationStatus = () => {
    const percentage = (waterCount / dailyGoal) * 100;
    if (percentage >= 100) return "🎉 Fully Hydrated!";
    if (percentage >= 75) return "💪 Well Hydrated";
    if (percentage >= 50) return "🌊 Good Progress";
    if (percentage >= 25) return "🚀 Getting Started";
    return "💧 Need More Water";
  };

  const getHydrationColor = () => {
    const percentage = (waterCount / dailyGoal) * 100;
    if (percentage >= 100) return theme.success;
    if (percentage >= 75) return theme.info;
    if (percentage >= 50) return theme.primary;
    if (percentage >= 25) return theme.warning;
    return theme.danger;
  };

  const renderWaterGlasses = () => {
    const glasses = [];
    for (let i = 0; i < dailyGoal; i++) {
      glasses.push(
        <View key={i} style={styles.glassContainer}>
          <Text
            style={[
              styles.glass,
              i < waterCount ? styles.filledGlass : styles.emptyGlass,
            ]}
          >
            {i < waterCount ? "💧" : "🥤"}
          </Text>
        </View>
      );
    }
    return glasses;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Water Progress Card */}
      <View
        style={[
          styles.progressCard,
          { 
            backgroundColor: theme.surface, 
            shadowColor: theme.shadow,
            borderColor: theme.border 
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.text }]}>💧 Daily Hydration Goal</Text>
        <View style={styles.waterDisplay}>
          <Text style={[styles.waterCount, { color: theme.primary }]}>
            {waterCount}
          </Text>
          <Text style={[styles.waterGoal, { color: theme.textSecondary }]}>/ {dailyGoal}</Text>
        </View>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          glasses of water
        </Text>
        
        {/* Enhanced Progress Bar */}
        <View style={[styles.progressBar, { backgroundColor: theme.borderLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min((waterCount / dailyGoal) * 100, 100)}%`,
                backgroundColor: theme.info,
              },
            ]}
          />
          <View
            style={[
              styles.progressGlow,
              {
                width: `${Math.min((waterCount / dailyGoal) * 100, 100)}%`,
                backgroundColor: theme.info,
                shadowColor: theme.info,
              },
            ]}
          />
        </View>
        
        {/* Hydration Status */}
        <Text style={[styles.statusText, { color: getHydrationColor() }]}>
          {getHydrationStatus()}
        </Text>
      </View>

      {/* Water Glasses Visual */}
      <View style={styles.glassesContainer}>{renderWaterGlasses()}</View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={removeWater}
          disabled={waterCount === 0}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={addWater}>
          <Text style={styles.addButtonText}>💧 Drink Water</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={removeWater}
          disabled={waterCount === 0}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
      </View>

      {/* Reminders Section */}
      <View style={styles.remindersSection}>
        <View style={styles.reminderHeader}>
          <Text style={styles.reminderTitle}>💬 Water Reminders</Text>
          <Switch
            value={remindersEnabled}
            onValueChange={toggleReminders}
            trackColor={{ false: "#e2e8f0", true: "#667eea" }}
            thumbColor={remindersEnabled ? "#ffffff" : "#cbd5e0"}
          />
        </View>

        {remindersEnabled && (
          <View style={styles.reminderTimes}>
            <Text style={styles.reminderTimesText}>
              Reminder times: {reminderTimes.join(", ")}
            </Text>
          </View>
        )}
      </View>

      {/* Fun Messages */}
      <View style={styles.funMessages}>
        <Text style={styles.funTitle}>💭 Hydration Wisdom</Text>
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>
            "Water Cold drinks, don't @ me 💧"
          </Text>
        </View>
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>
            "Hydrate your belly, not just your brain 🧠💧"
          </Text>
        </View>
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>
            "Your gut is thirsty, feed it some H2O 🌊"
          </Text>
        </View>
      </View>

      {/* Benefits Section */}
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>✨ Why Water Helps Digestion</Text>
        <Text style={styles.benefitText}>• Helps break down food</Text>
        <Text style={styles.benefitText}>• Prevents constipation</Text>
        <Text style={styles.benefitText}>• Reduces bloating</Text>
        <Text style={styles.benefitText}>• Keeps you energized</Text>
        <Text style={styles.benefitText}>• Flushes out toxins</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f9ff",
  },
  progressCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  waterDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  waterCount: {
    fontSize: 48,
    fontWeight: "700",
  },
  waterGoal: {
    fontSize: 24,
    fontWeight: "500",
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  progressGlow: {
    position: "absolute",
    height: "100%",
    borderRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
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
    color: "#2b6cb0",
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
    backgroundColor: "#3182ce",
    borderRadius: 6,
  },
  motivationalText: {
    fontSize: 16,
    color: "#2b6cb0",
    fontWeight: "600",
  },
  glassesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  glassContainer: {
    margin: 8,
  },
  glass: {
    fontSize: 32,
  },
  filledGlass: {
    opacity: 1,
  },
  emptyGlass: {
    opacity: 0.3,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: "#3182ce",
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 16,
    marginHorizontal: 15,
    alignItems: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  addButtonSubtext: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  removeButton: {
    backgroundColor: "#e2e8f0",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a5568",
  },
  remindersSection: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
  },
  reminderTimes: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f7fafc",
    borderRadius: 10,
  },
  reminderTimesText: {
    fontSize: 14,
    color: "#4a5568",
    textAlign: "center",
  },
  funMessages: {
    margin: 20,
  },
  funTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 15,
    textAlign: "center",
  },
  messageCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: "#2b6cb0",
    fontWeight: "500",
    textAlign: "center",
    fontStyle: "italic",
  },
  benefitsSection: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 15,
  },
  benefitText: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 8,
    lineHeight: 20,
  },
});
