import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.config';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      onAuthSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🥗</Text>
          <Text style={styles.appName}>GoodGut</Text>
          <Text style={styles.tagline}>Your hostel digestion buddy</Text>
        </View>

        <View style={styles.authCard}>
          <Text style={styles.authTitle}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.authButton, loading && styles.disabledButton]}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            <Text style={styles.authButtonText}>
              {isLogin ? 'Login' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchModeText}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.anonymousButton, loading && styles.disabledButton]}
            onPress={handleAnonymousSignIn}
            disabled={loading}
          >
            <Text style={styles.anonymousButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>App Features</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🦷</Text>
            <Text style={styles.featureText}>Chew Counter</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🚶‍♀️</Text>
            <Text style={styles.featureText}>Post-Meal Walk Tracker</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🍽️</Text>
            <Text style={styles.featureText}>Daily Digestive Tips</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>💧</Text>
            <Text style={styles.featureText}>Water Reminder</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>📦</Text>
            <Text style={styles.featureText}>Gut Box Checklist</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logoEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38a169',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#4a5568',
  },
  authCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 30,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f7fafc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  authButton: {
    backgroundColor: '#38a169',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  switchModeButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#4299e1',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#a0aec0',
    fontSize: 14,
  },
  anonymousButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  anonymousButtonText: {
    color: '#4a5568',
    fontSize: 16,
    fontWeight: '500',
  },
  featuresContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 10,
  },
  featureEmoji: {
    fontSize: 20,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#4a5568',
  },
});
