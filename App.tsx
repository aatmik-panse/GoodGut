import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.config';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Import components
import ChewTracker from './components/ChewTracker';
import WalkTracker from './components/WalkTracker';
import DigestiveTips from './components/DigestiveTips';
import WaterReminder from './components/WaterReminder';
import GutBox from './components/GutBox';
import AuthScreen from './screens/AuthScreen';
import SplashScreen from './screens/SplashScreen';

// Import types
import { ChewSession, WalkLog } from './types';

const Tab = createBottomTabNavigator();

function TabIcon({ focused, emoji }: { focused: boolean; emoji: string }) {
  const { theme } = useTheme();
  return (
    <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.6, color: theme.text }]}>
      {emoji}
    </Text>
  );
}

function ThemeToggle() {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.themeToggle, { backgroundColor: theme.border }]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <View 
        style={[
          styles.toggleSlider,
          { backgroundColor: theme.primary },
          isDarkMode ? styles.toggleSliderRight : styles.toggleSliderLeft
        ]}
      >
        <Text style={styles.toggleIcon}>
          {isDarkMode ? '🌙' : '☀️'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function AppContent() {
  const { theme, isDarkMode } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChewSessionComplete = (session: ChewSession) => {
    console.log('Chew session completed:', session);
    // Here you would typically save to Firebase
  };

  const handleWalkLogged = (walkLog: WalkLog) => {
    console.log('Walk logged:', walkLog);
    // Here you would typically save to Firebase
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading GoodGut...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={() => console.log('Auth successful')} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: [styles.tabBar, { 
            backgroundColor: theme.tabBackground,
            borderTopColor: theme.tabBorder 
          }],
          tabBarActiveTintColor: theme.tabActive,
          tabBarInactiveTintColor: theme.tabInactive,
          headerStyle: [styles.header, { 
            backgroundColor: theme.surface,
            borderBottomColor: theme.border 
          }],
          headerTintColor: theme.text,
          headerTitleStyle: [styles.headerTitle, { color: theme.text }],
        }}
      >
        <Tab.Screen
          name="Chew"
          options={{
            title: 'Chew Counter',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🦷" />,
            headerRight: () => <ThemeToggle />,
          }}
        >
          {() => <ChewTracker onSessionComplete={handleChewSessionComplete} />}
        </Tab.Screen>
        
        <Tab.Screen
          name="Walk"
          options={{
            title: 'Post-Meal Walk',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🚶‍♀️" />,
            headerRight: () => <ThemeToggle />,
          }}
        >
          {() => <WalkTracker onWalkLogged={handleWalkLogged} />}
        </Tab.Screen>
        
        <Tab.Screen
          name="Tips"
          options={{
            title: 'What To Eat',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🍽️" />,
            headerRight: () => <ThemeToggle />,
          }}
          component={DigestiveTips}
        />
        
        <Tab.Screen
          name="Water"
          options={{
            title: 'Water Tracker',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="💧" />,
            headerRight: () => <ThemeToggle />,
          }}
          component={WaterReminder}
        />
        
        <Tab.Screen
          name="GutBox"
          options={{
            title: 'Gut Box',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="📦" />,
            headerRight: () => <ThemeToggle />,
          }}
          component={GutBox}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4a5568',
  },
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  // Theme toggle styles
  themeToggle: {
    width: 50,
    height: 26,
    borderRadius: 13,
    padding: 2,
    marginRight: 15,
    justifyContent: 'center',
  },
  toggleSlider: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleSliderLeft: {
    alignSelf: 'flex-start',
  },
  toggleSliderRight: {
    alignSelf: 'flex-end',
  },
  toggleIcon: {
    fontSize: 12,
  },
});
