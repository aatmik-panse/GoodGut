import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Easing,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { soundUtils } from "../utils/soundUtils";
import { ChewSession } from "../types";
import { useTheme } from "../contexts/ThemeContext";

interface ChewTrackerProps {
  onSessionComplete: (session: ChewSession) => void;
}

export default function ChewTracker({ onSessionComplete }: ChewTrackerProps) {
  const { theme } = useTheme();
  const [mode, setMode] = useState<"tap" | "timer">("tap");
  const [chewCount, setChewCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Timer and lap tracking
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [lapTimes, setLapTimes] = useState<
    Array<{ lap: number; time: string }>
  >([]);
  const [lapCount, setLapCount] = useState(0);

  // Animation values
  const [scaleAnim] = useState(new Animated.Value(1));
  const [progressAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [rippleAnim] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));
  const [countAnim] = useState(new Animated.Value(1));

  // Sound initialization flag
  const soundInitialized = useRef(false);

  const targetChews = 30;

  // Initialize sounds and animations
  useEffect(() => {
    // Mark sound as initialized
    soundInitialized.current = true;

    // Start continuous pulse animation
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startPulse();
  }, []);

  // Timer update effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (sessionStartTime) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - sessionStartTime);
      }, 100); // Update every 100ms for smooth display
    }

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Helper function to format time
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Add completed lap
  const addCompletedLap = () => {
    if (sessionStartTime) {
      const lapTime = formatTime(currentTime);
      const newLap = { lap: lapCount + 1, time: lapTime };
      setLapTimes((prev) => [...prev, newLap]);
      setLapCount((prev) => prev + 1);
    }
  };

  // Handle tap chew
  const handleTapChew = () => {
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }

    const newCount = chewCount + 1;
    setChewCount(newCount);

    // Trigger animations
    triggerTapAnimation();
    triggerCountBounce();

    // Play sound and haptic feedback
    if (soundInitialized.current) {
      soundUtils.playTapSound();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check if target reached
    if (newCount >= targetChews) {
      completeSession();
    }

    // Milestone celebration every 5 chews
    if (newCount % 5 === 0) {
      triggerMilestoneAnimation();
    }
  };

  // Trigger tap animation
  const triggerTapAnimation = () => {
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.back(1.5),
        useNativeDriver: true,
      }),
    ]).start();

    // Ripple effect
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  // Trigger count bounce
  const triggerCountBounce = () => {
    bounceAnim.setValue(0);
    Animated.timing(bounceAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.back(2),
      useNativeDriver: true,
    }).start(() => {
      bounceAnim.setValue(0);
    });
  };

  // Trigger milestone animation
  const triggerMilestoneAnimation = () => {
    glowAnim.setValue(0);
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: false,
    }).start(() => {
      glowAnim.setValue(0);
    });
  };

  // Complete session
  const completeSession = () => {
    if (sessionStartTime) {
      addCompletedLap();

      const session: ChewSession = {
        id: Date.now().toString(),
        userId: 'anonymous', // This will be updated when auth is implemented
        chewCount: targetChews,
        targetChews: targetChews,
        mode: mode,
        completedAt: new Date(),
        createdAt: new Date(),
        duration: currentTime,
      };

      onSessionComplete(session);

      // Success feedback
      if (soundInitialized.current) {
        soundUtils.playSuccessSound();
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset for next session
      setChewCount(0);
      setSessionStartTime(null);
      setCurrentTime(0);
    }
  };

  // Finish current chew cycle
  const finishCurrentChew = () => {
    if (chewCount > 0 || isActive) {
      addCompletedLap();
      setChewCount(0);

      if (mode === "timer") {
        setIsActive(false);
        setTimeLeft(30);
      }
    }
  };

  // Reset session
  const resetSession = () => {
    setChewCount(0);
    setSessionStartTime(null);
    setCurrentTime(0);
    setLapTimes([]);
    setLapCount(0);
    setIsActive(false);
    setTimeLeft(30);
  };

  // Timer mode functions
  const startTimer = () => {
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }
    setIsActive(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            completeSession();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Animation interpolations
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", `${(chewCount / targetChews) * 100}%`],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  const bounceTranslateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scrollContent}>
          {/* Mode Selector Card */}
          <View
            style={[
              styles.modeSelectorCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Choose Mode
            </Text>
            <View
              style={[
                styles.modeSelector,
                { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === "tap" && [
                    styles.activeModeButton,
                    { backgroundColor: theme.primary },
                  ],
                ]}
                onPress={() => setMode("tap")}
              >
                <Text
                  style={[
                    styles.modeText,
                    { color: theme.textSecondary },
                    mode === "tap" && [
                      styles.activeModeText,
                      { color: theme.surface },
                    ],
                  ]}
                >
                  🖱️ Tap Mode
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === "timer" && [
                    styles.activeModeButton,
                    { backgroundColor: theme.primary },
                  ],
                ]}
                onPress={() => setMode("timer")}
              >
                <Text
                  style={[
                    styles.modeText,
                    { color: theme.textSecondary },
                    mode === "timer" && [
                      styles.activeModeText,
                      { color: theme.surface },
                    ],
                  ]}
                >
                  ⏱️ Timer Mode
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Card */}
          <View
            style={[
              styles.progressCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Progress to Goal
            </Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.borderLight },
                ]}
              >
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressWidth,
                      backgroundColor: theme.success,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.progressGlow,
                    {
                      width: progressWidth,
                      opacity: glowOpacity,
                      backgroundColor: theme.success,
                      shadowColor: theme.success,
                    },
                  ]}
                />
              </View>
              <Animated.Text
                style={[
                  styles.progressText,
                  {
                    color: theme.textSecondary,
                    transform: [{ translateY: bounceTranslateY }],
                  },
                ]}
              >
                {chewCount} / {targetChews} chews
              </Animated.Text>
            </View>
          </View>

          {/* Main Action Area */}
          {mode === "tap" ? (
            <View style={styles.tapArea}>
              <Animated.View
                style={[
                  styles.tapButtonContainer,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Animated.View
                  style={[
                    styles.rippleEffect,
                    {
                      transform: [{ scale: rippleAnim }, { scale: scaleAnim }],
                      opacity: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0],
                      }),
                    },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.tapButton,
                    {
                      backgroundColor: theme.primary,
                      shadowColor: theme.shadow,
                    },
                  ]}
                  onPress={handleTapChew}
                  activeOpacity={0.8}
                >
                  <Animated.Text
                    style={[
                      styles.tapButtonText,
                      {
                        color: theme.surface,
                        transform: [{ scale: countAnim }],
                      },
                    ]}
                  >
                    TAP TO CHEW
                  </Animated.Text>
                  <Text
                    style={[
                      styles.tapButtonSubtext,
                      { color: theme.surface + "90" },
                    ]}
                  >
                    {chewCount} chews
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          ) : (
            <View style={styles.timerArea}>
              <Text style={[styles.timerText, { color: theme.text }]}>
                {timeLeft}s
              </Text>
              <TouchableOpacity
                style={[
                  styles.timerButton,
                  { backgroundColor: theme.primary },
                  isActive && [
                    styles.activeTimerButton,
                    { backgroundColor: theme.success },
                  ],
                ]}
                onPress={startTimer}
                disabled={isActive}
              >
                <Text
                  style={[styles.timerButtonText, { color: theme.surface }]}
                >
                  {isActive ? "Chewing..." : "Start Timer"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.finishButton,
                { backgroundColor: theme.success },
                chewCount === 0 &&
                  !isActive && [
                    styles.disabledButton,
                    { backgroundColor: theme.buttonDisabled },
                  ],
              ]}
              onPress={finishCurrentChew}
              disabled={chewCount === 0 && !isActive}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.surface },
                  chewCount === 0 && !isActive && { color: theme.textMuted },
                ]}
              >
                ✅ Finish This Chew
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.resetButton,
                { backgroundColor: theme.buttonSecondary },
              ]}
              onPress={resetSession}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.buttonSecondaryText },
                ]}
              >
                🔄 Reset
              </Text>
            </TouchableOpacity>
          </View>

          {/* Session Timer Card */}
          <View
            style={[
              styles.timerContainer,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Session Time
            </Text>
            <Text style={[styles.timerDisplay, { color: theme.primary }]}>
              {sessionStartTime ? formatTime(currentTime) : "00:00"}
            </Text>
          </View>

          {/* Completed Cycles */}
          {lapTimes.length > 0 && (
            <View
              style={[
                styles.lapContainer,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  shadowColor: theme.shadow,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Completed Cycles
              </Text>
              <ScrollView
                style={styles.lapScrollView}
                showsVerticalScrollIndicator={false}
              >
                {lapTimes.map((lap, index) => (
                  <View
                    key={index}
                    style={[
                      styles.lapItem,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        borderLeftColor: theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.lapText, { color: theme.textSecondary }]}
                    >
                      🍽️ Cycle {lap.lap}: {lap.time}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
    minHeight: "100%",
  },
  modeSelectorCard: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressCard: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  modeSelector: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 2,
  },
  activeModeButton: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeModeText: {
    fontWeight: "700",
  },
  progressContainer: {
    width: "100%",
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressGlow: {
    position: "absolute",
    height: "100%",
    borderRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  progressText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  tapArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
    marginBottom: 20,
  },
  tapButtonContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  rippleEffect: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  tapButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tapButtonText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  tapButtonSubtext: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  timerArea: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 20,
  },
  timerButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  activeTimerButton: {
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  timerButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  finishButton: {
    marginRight: 6,
  },
  resetButton: {
    marginLeft: 6,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  timerContainer: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timerDisplay: {
    fontSize: 32,
    fontWeight: "700",
  },
  lapContainer: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lapScrollView: {
    maxHeight: 200,
  },
  lapItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  lapText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
