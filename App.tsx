import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.config';

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
  return (
    <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}>
      {emoji}
    </Text>
  );
}

export default function App() {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading GoodGut...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={() => console.log('Auth successful')} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#667eea',
          tabBarInactiveTintColor: '#a0aec0',
          headerStyle: styles.header,
          headerTintColor: '#2d3748',
          headerTitleStyle: styles.headerTitle,
        }}
      >
        <Tab.Screen
          name="Chew"
          options={{
            title: 'Chew Counter',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🦷" />,
          }}
        >
          {() => <ChewTracker onSessionComplete={handleChewSessionComplete} />}
        </Tab.Screen>
        
        <Tab.Screen
          name="Walk"
          options={{
            title: 'Post-Meal Walk',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🚶‍♀️" />,
          }}
        >
          {() => <WalkTracker onWalkLogged={handleWalkLogged} />}
        </Tab.Screen>
        
        <Tab.Screen
          name="Tips"
          options={{
            title: 'What To Eat',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🍽️" />,
          }}
          component={DigestiveTips}
        />
        
        <Tab.Screen
          name="Water"
          options={{
            title: 'Water Tracker',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="💧" />,
          }}
          component={WaterReminder}
        />
        
        <Tab.Screen
          name="GutBox"
          options={{
            title: 'Gut Box',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="📦" />,
          }}
          component={GutBox}
        />
      </Tab.Navigator>
    </NavigationContainer>
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
  },
});
