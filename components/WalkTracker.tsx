import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { WalkLog } from '../types';
import { storeData, getData, calculateStreak } from '../utils';
import { useTheme } from '../contexts/ThemeContext';

interface WalkTrackerProps {
  onWalkLogged: (walkLog: WalkLog) => void;
}

export default function WalkTracker({ onWalkLogged }: WalkTrackerProps) {
  const { theme } = useTheme();
  const [streak, setStreak] = useState(0);
  const [todayWalked, setTodayWalked] = useState(false);
  const [walkLogs, setWalkLogs] = useState<WalkLog[]>([]);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadWalkData();
  }, []);

  const loadWalkData = async () => {
    try {
      const logs = await getData('walkLogs') || [];
      const today = new Date().toDateString();
      
      setWalkLogs(logs);
      
      // Check if walked today
      const todayLog = logs.find((log: WalkLog) => 
        new Date(log.completedAt).toDateString() === today
      );
      setTodayWalked(!!todayLog);
      
      // Calculate streak
      const walkDates = logs.map((log: WalkLog) => new Date(log.completedAt));
      const currentStreak = calculateStreak(walkDates);
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error loading walk data:', error);
    }
  };

  const logWalk = async () => {
    if (todayWalked) {
      Alert.alert('Already walked today! 🎉', 'You\'re on fire! Keep it up tomorrow.');
      return;
    }

    const newWalkLog: WalkLog = {
      id: Date.now().toString(),
      userId: 'current-user', // Will be replaced with actual user ID
      completedAt: new Date(),
      streak: streak + 1,
    };

    const updatedLogs = [...walkLogs, newWalkLog];
    
    try {
      await storeData('walkLogs', updatedLogs);
      setWalkLogs(updatedLogs);
      setTodayWalked(true);
      setStreak(newWalkLog.streak);
      
      // Animate button
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Show success message
      const messages = [
        'You walked your food into heaven! 😄',
        'Your gut is doing a happy dance! 💃',
        'Walking legend in the making! 🚶‍♀️✨',
        'Digestion level: Expert! 🏆',
        'Your belly says thank you! 🙏'
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      Alert.alert('Walk Logged! 🚶‍♀️', randomMessage);
      onWalkLogged(newWalkLog);
    } catch (error) {
      console.error('Error logging walk:', error);
      Alert.alert('Error', 'Failed to log your walk. Please try again.');
    }
  };

  const getStreakEmoji = () => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '🔥';
    if (streak >= 7) return '⭐';
    if (streak >= 3) return '💪';
    return '🌱';
  };

  const getMotivationalText = () => {
    if (streak === 0) return 'Start your walking journey!';
    if (streak === 1) return 'Great start! Keep it up!';
    if (streak < 7) return 'Building the habit!';
    if (streak < 14) return 'You\'re on fire!';
    if (streak < 30) return 'Walking champion!';
    return 'Absolute legend!';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Streak Display */}
      <View style={[styles.streakContainer, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
        <Text style={styles.streakEmoji}>{getStreakEmoji()}</Text>
        <Text style={[styles.streakNumber, { color: theme.primary }]}>{streak}</Text>
        <Text style={[styles.streakLabel, { color: theme.text }]}>Day Streak</Text>
        <Text style={[styles.motivationalText, { color: theme.textSecondary }]}>{getMotivationalText()}</Text>
      </View>

      {/* Walk Button */}
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.walkButton,
            { backgroundColor: todayWalked ? theme.success : theme.primary },
            todayWalked && styles.walkButtonCompleted
          ]}
          onPress={logWalk}
          disabled={todayWalked}
        >
          <Text style={[
            styles.walkButtonText,
            { color: theme.buttonText },
            todayWalked && styles.walkButtonTextCompleted
          ]}>
            {todayWalked ? '✅ Walked Today!' : '🚶‍♀️ I Walked After Eating'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Tips */}
      <View style={[styles.tipsContainer, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
        <Text style={[styles.tipsTitle, { color: theme.text }]}>💡 Walking Tips</Text>
        <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Walk for 10-15 minutes after meals</Text>
        <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Light pace is perfect - no need to rush</Text>
        <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Even a short walk helps digestion</Text>
        <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Fresh air is a bonus! 🌬️</Text>
      </View>

      {/* Recent Activity */}
      {walkLogs.length > 0 && (
        <View style={[styles.recentActivity, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
          <Text style={[styles.recentTitle, { color: theme.text }]}>Recent Walks</Text>
          {walkLogs
            .slice(-3)
            .reverse()
            .map((log, index) => (
              <View key={log.id} style={[styles.activityItem, { borderBottomColor: theme.border }]}>
                <Text style={[styles.activityDate, { color: theme.textSecondary }]}>
                  {new Date(log.completedAt).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.activityEmoji}>🚶‍♀️</Text>
              </View>
            ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0fff4',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 30,
    textAlign: 'center',
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  streakEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#38a169',
    marginBottom: 5,
  },
  streakLabel: {
    fontSize: 18,
    color: '#4a5568',
    fontWeight: '600',
    marginBottom: 10,
  },
  motivationalText: {
    fontSize: 16,
    color: '#38a169',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  walkButton: {
    backgroundColor: '#38a169',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#38a169',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  walkButtonCompleted: {
    backgroundColor: '#68d391',
  },
  walkButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  walkButtonTextCompleted: {
    color: 'white',
  },
  tipsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 15,
  },
  tipText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
    lineHeight: 20,
  },
  recentActivity: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '100%',
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  activityDate: {
    fontSize: 14,
    color: '#4a5568',
  },
  activityEmoji: {
    fontSize: 18,
  },
});
