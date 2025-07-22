import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { ChewSession } from '../types';

interface ChewTrackerProps {
  onSessionComplete: (session: ChewSession) => void;
}

export default function ChewTracker({ onSessionComplete }: ChewTrackerProps) {
  const [mode, setMode] = useState<'tap' | 'timer'>('tap');
  const [chewCount, setChewCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [progressAnim] = useState(new Animated.Value(0));

  const targetChews = 30;

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
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: chewCount / targetChews,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [chewCount]);

  const handleTap = () => {
    if (mode === 'tap') {
      setChewCount(prev => {
        const newCount = prev + 1;
        
        // Animate the tap
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();

        if (newCount >= targetChews) {
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

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressText}>
          {chewCount}/{targetChews} chews
        </Text>
      </View>

      {/* Main Action Area */}
      {mode === 'tap' ? (
        <Animated.View style={[styles.tapArea, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity style={styles.tapButton} onPress={handleTap}>
            <Text style={styles.tapButtonText}>TAP TO CHEW</Text>
            <Text style={styles.chewCount}>{chewCount}</Text>
          </TouchableOpacity>
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
