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

  // Helper function to start session timer
  const startSessionTimer = () => {
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }
  };

  // Helper function to add lap time when cycle completes and continue
  const addCompletedLap = () => {
    if (sessionStartTime) {
      const lapTime = formatTime(Date.now() - sessionStartTime);
      const newLapNumber = lapCount + 1;
      setLapTimes((prev) => [...prev, { lap: newLapNumber, time: lapTime }]);
      setLapCount(newLapNumber);

      // Reset session timer for next lap
      setSessionStartTime(Date.now());
    }
  };

  // Helper function to add lap time when session ends (no timer reset)
  const addFinalLap = () => {
    if (sessionStartTime) {
      const lapTime = formatTime(Date.now() - sessionStartTime);
      const newLapNumber = lapCount + 1;
      setLapTimes((prev) => [...prev, { lap: newLapNumber, time: lapTime }]);
      setLapCount(newLapNumber);
    }
  };
  
  // Function to manually finish current chew cycle
  const finishCurrentChew = () => {
    if (chewCount > 0 || isActive) {
      // If no session timer, start it and record a minimal lap
      if (!sessionStartTime) {
        const now = Date.now();
        setSessionStartTime(now);
        // Record a minimal time lap (1 second)
        const lapTime = formatTime(1000);
        const newLapNumber = lapCount + 1;
        setLapTimes((prev) => [...prev, { lap: newLapNumber, time: lapTime }]);
        setLapCount(newLapNumber);
        // Start new timer for next cycle
        setSessionStartTime(Date.now());
      } else {
        // Add the current cycle as completed
        addCompletedLap();
      }
      
      // Reset chew count for next cycle
      setChewCount(0);
      progressAnim.setValue(0);
      // Stop timer if in timer mode
      if (mode === "timer") {
        setIsActive(false);
        setTimeLeft(30);
      }
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && mode === "timer" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && mode === "timer") {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  useEffect(() => {
    // Enhanced progress bar animation with glow effect
    const progress = chewCount / targetChews;

    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: progress,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Milestone celebrations
    if (chewCount > 0 && chewCount % 5 === 0 && chewCount < targetChews) {
      playMilestoneAnimation();
    }
  }, [chewCount]);

  // Sound and haptic functions
  const playTapSound = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await soundUtils.playTapSound();
    } catch (error) {
      console.log("Haptic/sound feedback failed:", error);
    }
  };

  const playSuccessSound = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await soundUtils.playSuccessSound();
    } catch (error) {
      console.log("Success haptic/sound failed:", error);
    }
  };

  const playMilestoneAnimation = () => {
    // Bounce animation for milestones
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTap = () => {
    if (mode === "tap") {
      // Start session timer on first tap
      startSessionTimer();

      // Play haptic feedback immediately
      playTapSound();

      setChewCount((prev) => {
        const newCount = prev + 1;

        // Enhanced tap animations
        Animated.parallel([
          // Scale animation
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.15,
              duration: 80,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 120,
              easing: Easing.out(Easing.back(1.5)),
              useNativeDriver: true,
            }),
          ]),
          // Ripple effect
          Animated.sequence([
            Animated.timing(rippleAnim, {
              toValue: 1,
              duration: 300,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(rippleAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          // Count number animation
          Animated.sequence([
            Animated.timing(countAnim, {
              toValue: 1.3,
              duration: 100,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(countAnim, {
              toValue: 1,
              duration: 200,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
          ]),
        ]).start();

        if (newCount >= targetChews) {
          playSuccessSound();
          handleSessionComplete();
        }

        return newCount;
      });
    }
  };

  const startTimer = () => {
    // Start session timer when timer mode begins
    startSessionTimer();
    setIsActive(true);
    setTimeLeft(30);
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    setChewCount((prev) => {
      const newCount = prev + targetChews;
      handleSessionComplete();
      return newCount;
    });
  };

  const handleSessionComplete = () => {
    const session: ChewSession = {
      id: Date.now().toString(),
      userId: "current-user", // Will be replaced with actual user ID
      chewCount: mode === "timer" ? targetChews : chewCount,
      targetChews,
      mode,
      completedAt: new Date(),
      createdAt: new Date(),
    };

    // Add completed cycle before showing alert
    addCompletedLap();

    // Reset chew count to 0 for next cycle
    setChewCount(0);
    progressAnim.setValue(0);

    Alert.alert(
      "🦷 Your gut says thanks!",
      "Great job on mindful chewing! Your digestion will thank you.",
      [
        {
          text: "Continue",
          onPress: () => {
            onSessionComplete(session);
            // User can continue with next cycle
          },
        },
      ]
    );
  };

  const resetSession = () => {
    // If there was an active session, record it as a completed cycle
    if (sessionStartTime && (chewCount > 0 || isActive)) {
      addFinalLap();
    }

    setChewCount(0);
    setIsActive(false);
    setTimeLeft(30);
    progressAnim.setValue(0);

    // Reset timer and lap data completely
    setSessionStartTime(null);
    setCurrentTime(0);
    setLapTimes([]);
    setLapCount(0);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const rippleOpacity = rippleAnim.interpolate({
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >


        {/* Mode Selector */}
        <View style={[styles.modeSelector, { backgroundColor: theme.buttonSecondary }]}>
          <TouchableOpacity
            style={[styles.modeButton, mode === "tap" && styles.activeModeButton]}
            onPress={() => setMode("tap")}
          >
            <Text
              style={[styles.modeText, mode === "tap" && styles.activeModeText]}
            >
              Tap Mode
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === "timer" && styles.activeModeButton,
            ]}
            onPress={() => setMode("timer")}
          >
            <Text
              style={[styles.modeText, mode === "timer" && styles.activeModeText]}
            >
              Timer Mode
            </Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Progress Bar with Glow */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
            <Animated.View
              style={[
                styles.progressGlow,
                {
                  width: progressWidth,
                  opacity: glowOpacity,
                },
              ]}
            />
          </View>
          <Animated.Text
            style={[
              styles.progressText,
              { transform: [{ translateY: bounceTranslateY }] },
            ]}
          >
            {chewCount}/{targetChews} chews
          </Animated.Text>
        </View>

        {/* Enhanced Main Action Area */}
        {mode === "tap" ? (
          <Animated.View
            style={[styles.tapArea, { transform: [{ scale: pulseAnim }] }]}
          >
            <View style={styles.tapButtonContainer}>
              {/* Ripple Effect */}
              <Animated.View
                style={[
                  styles.rippleEffect,
                  {
                    transform: [{ scale: rippleScale }],
                    opacity: rippleOpacity,
                  },
                ]}
              />
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity style={styles.tapButton} onPress={handleTap}>
                  <Text style={styles.tapButtonText}>TAP TO CHEW</Text>
                  <Animated.Text
                    style={[
                      styles.chewCount,
                      { transform: [{ scale: countAnim }] },
                    ]}
                  >
                    {chewCount}
                  </Animated.Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.timerArea}>
            <Text style={styles.timerText}>{timeLeft}s</Text>
            <TouchableOpacity
              style={[styles.timerButton, isActive && styles.activeTimerButton]}
              onPress={startTimer}
              disabled={isActive}
            >
              <Text style={styles.timerButtonText}>
                {isActive ? "CHEWING..." : "START 30s CHEW"}
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
              (chewCount === 0 && !isActive) && styles.disabledButton
            ]} 
            onPress={finishCurrentChew}
            disabled={chewCount === 0 && !isActive}
          >
            <Text style={[
              styles.actionButtonText,
              styles.finishButtonText,
              (chewCount === 0 && !isActive) && styles.disabledButtonText
            ]}>Finish This Chew</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.resetButton]} onPress={resetSession}>
            <Text style={[styles.actionButtonText, styles.resetButtonText]}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Session Timer */}
        <View style={[styles.timerContainer, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
          <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>Session Time</Text>
          <Text style={[styles.timerDisplay, { color: theme.primary }]}>
            {sessionStartTime ? formatTime(currentTime) : "00:00"}
          </Text>
        </View>

        {/* Cycle Times List */}
        {lapTimes.length > 0 && (
          <View style={[styles.lapContainer, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
            <Text style={[styles.lapHeader, { color: theme.text }]}>Completed Cycles</Text>
            <ScrollView
              style={styles.lapScrollView}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {lapTimes.map((lap, index) => (
                <View key={index} style={[styles.lapItem, { backgroundColor: theme.surfaceSecondary, borderLeftColor: theme.primary }]}>
                  <Text style={[styles.lapText, { color: theme.textSecondary }]}>
                    Cycle {lap.lap}: {lap.time}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
    minHeight: "100%",
  },
  modeSelector: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 25,
    padding: 4,
    marginBottom: 30,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: "center",
  },
  activeModeButton: {
    backgroundColor: "#667eea",
  },
  modeText: {
    fontSize: 16,
    color: "#4a5568",
    fontWeight: "600",
  },
  activeModeText: {
    color: "white",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 40,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#48bb78",
    borderRadius: 4,
  },
  progressGlow: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#48bb78",
    borderRadius: 4,
    shadowColor: "#48bb78",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  progressText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    color: "#4a5568",
    fontWeight: "600",
  },
  tapArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#667eea",
    opacity: 0.3,
  },
  tapButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tapButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chewCount: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  timerArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: 30,
  },
  timerButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  activeTimerButton: {
    backgroundColor: "#48bb78",
  },
  timerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: "center",
  },
  finishButton: {
    backgroundColor: "#48bb78",
  },
  resetButton: {
    backgroundColor: "#e2e8f0",
  },
  disabledButton: {
    backgroundColor: "#cbd5e0",
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  finishButtonText: {
    color: "white",
  },
  resetButtonText: {
    color: "#4a5568",
  },
  disabledButtonText: {
    color: "#a0aec0",
  },
  // Timer styles
  timerContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerLabel: {
    fontSize: 14,
    color: "#4a5568",
    fontWeight: "600",
    marginBottom: 5,
  },
  timerDisplay: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#667eea",
    fontFamily: "monospace",
  },
  // Lap list styles
  lapContainer: {
    width: "100%",
    marginTop: 20,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
  },
  lapHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 10,
    textAlign: "center",
  },
  lapScrollView: {
    maxHeight: 150,
  },
  lapItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9ff",
    borderRadius: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#667eea",
  },
  lapText: {
    fontSize: 14,
    color: "#4a5568",
    fontWeight: "500",
    fontFamily: "monospace",
  },
});
