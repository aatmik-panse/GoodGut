import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { soundUtils } from '../utils/soundUtils';
import { ChewSession } from '../types';

interface ChewTrackerProps {
  onSessionComplete: (session: ChewSession) => void;
}

export default function ChewTracker({ onSessionComplete }: ChewTrackerProps) {
  const [mode, setMode] = useState<'tap' | 'timer'>('tap');
  const [chewCount, setChewCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && mode === 'timer' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && mode === 'timer') {
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
      console.log('Haptic/sound feedback failed:', error);
    }
  };
  
  const playSuccessSound = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await soundUtils.playSuccessSound();
    } catch (error) {
      console.log('Success haptic/sound failed:', error);
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
    if (mode === 'tap') {
      // Play haptic feedback immediately
      playTapSound();
      
      setChewCount(prev => {
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
    setIsActive(true);
    setTimeLeft(30);
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    setChewCount(prev => {
      const newCount = prev + targetChews;
      handleSessionComplete();
      return newCount;
    });
  };

  const handleSessionComplete = () => {
    const session: ChewSession = {
      id: Date.now().toString(),
      userId: 'current-user', // Will be replaced with actual user ID
      chewCount: mode === 'timer' ? targetChews : chewCount,
      targetChews,
      mode,
      completedAt: new Date(),
      createdAt: new Date(),
    };

    Alert.alert(
      '🦷 Your gut says thanks!',
      'Great job on mindful chewing! Your digestion will thank you.',
      [
        {
          text: 'Awesome!',
          onPress: () => {
            onSessionComplete(session);
            resetSession();
          },
        },
      ]
    );
  };

  const resetSession = () => {
    setChewCount(0);
    setIsActive(false);
    setTimeLeft(30);
    progressAnim.setValue(0);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
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
    <View style={styles.container}>
      <Text style={styles.title}>Chew Counter 🦷</Text>
      
      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'tap' && styles.activeModeButton]}
          onPress={() => setMode('tap')}
        >
          <Text style={[styles.modeText, mode === 'tap' && styles.activeModeText]}>
            Tap Mode
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'timer' && styles.activeModeButton]}
          onPress={() => setMode('timer')}
        >
          <Text style={[styles.modeText, mode === 'timer' && styles.activeModeText]}>
            Timer Mode
          </Text>
        </TouchableOpacity>
      </View>

      {/* Enhanced Progress Bar with Glow */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          <Animated.View 
            style={[
              styles.progressGlow, 
              { 
                width: progressWidth,
                opacity: glowOpacity 
              }
            ]} 
          />
        </View>
        <Animated.Text 
          style={[
            styles.progressText,
            { transform: [{ translateY: bounceTranslateY }] }
          ]}
        >
          {chewCount}/{targetChews} chews
        </Animated.Text>
      </View>

      {/* Enhanced Main Action Area */}
      {mode === 'tap' ? (
        <Animated.View style={[styles.tapArea, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.tapButtonContainer}>
            {/* Ripple Effect */}
            <Animated.View 
              style={[
                styles.rippleEffect,
                {
                  transform: [{ scale: rippleScale }],
                  opacity: rippleOpacity,
                }
              ]} 
            />
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity style={styles.tapButton} onPress={handleTap}>
                <Text style={styles.tapButtonText}>TAP TO CHEW</Text>
                <Animated.Text 
                  style={[
                    styles.chewCount,
                    { transform: [{ scale: countAnim }] }
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
              {isActive ? 'CHEWING...' : 'START 30s CHEW'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={resetSession}>
        <Text style={styles.resetButtonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 30,
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 25,
    padding: 4,
    marginBottom: 30,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: '#667eea',
  },
  modeText: {
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '600',
  },
  activeModeText: {
    color: 'white',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#48bb78',
    borderRadius: 4,
  },
  progressGlow: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#48bb78',
    borderRadius: 4,
    shadowColor: '#48bb78',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '600',
  },
  tapArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapButtonContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#667eea',
    opacity: 0.3,
  },
  tapButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tapButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chewCount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  timerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 30,
  },
  timerButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  activeTimerButton: {
    backgroundColor: '#48bb78',
  },
  timerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  resetButtonText: {
    color: '#4a5568',
    fontSize: 16,
    fontWeight: '600',
  },
});
