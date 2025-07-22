import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const scaleAnim = new Animated.Value(0.3);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      // Fade in
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Scale up
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      // Wait a bit
      Animated.delay(500),
    ]).start(() => {
      // Navigate to the main app after animation completes
      setTimeout(onFinish, 500);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.emoji}>🥗</Text>
        <Text style={styles.title}>GoodGut</Text>
        <Text style={styles.subtitle}>Your hostel digestion buddy</Text>
      </Animated.View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with 💚 for hostel students</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#38a169',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#4a5568',
    marginBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    color: '#718096',
    fontSize: 14,
  },
});
