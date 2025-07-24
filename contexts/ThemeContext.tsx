import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StyleSheet } from 'react-native';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Light theme colors
export const lightTheme = {
  // Background colors
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceSecondary: '#f1f5f9',
  surfaceElevated: '#ffffff',
  
  // Text colors
  text: '#1a202c',
  textSecondary: '#4a5568',
  textTertiary: '#718096',
  textMuted: '#a0aec0',
  
  // Primary colors
  primary: '#6366f1',
  primaryLight: '#8b5cf6',
  primaryDark: '#4f46e5',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  
  // Gradient colors
  gradientStart: '#6366f1',
  gradientEnd: '#8b5cf6',
  
  // UI element colors
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Tab colors
  tabBackground: '#ffffff',
  tabBorder: '#e2e8f0',
  tabActive: '#6366f1',
  tabInactive: '#9ca3af',
  
  // Button colors
  buttonSecondary: '#f1f5f9',
  buttonSecondaryText: '#374151',
  buttonDisabled: '#d1d5db',
  buttonDisabledText: '#a0aec0',
};

// Dark theme colors
export const darkTheme = {
  // Background colors
  background: '#0f172a',
  surface: '#1e293b',
  surfaceSecondary: '#0f172a',
  surfaceElevated: '#334155',
  
  // Text colors
  text: '#f8fafc',
  textSecondary: '#e2e8f0',
  textTertiary: '#94a3b8',
  textMuted: '#64748b',
  
  // Primary colors
  primary: '#8b5cf6',
  primaryLight: '#a78bfa',
  primaryDark: '#7c3aed',
  success: '#22c55e',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#60a5fa',
  
  // Gradient colors
  gradientStart: '#8b5cf6',
  gradientEnd: '#6366f1',
  
  // UI element colors
  border: '#334155',
  borderLight: '#475569',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Tab colors
  tabBackground: '#1e293b',
  tabBorder: '#334155',
  tabActive: '#8b5cf6',
  tabInactive: '#64748b',
  
  // Button colors
  buttonSecondary: '#334155',
  buttonSecondaryText: '#e2e8f0',
  buttonDisabled: '#475569',
  buttonDisabledText: '#718096',
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Common styles that use theme
export const createThemedStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  surface: {
    backgroundColor: theme.surface,
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    color: theme.text,
  },
  textSecondary: {
    color: theme.textSecondary,
  },
  textTertiary: {
    color: theme.textTertiary,
  },
  button: {
    backgroundColor: theme.primary,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: theme.buttonSecondary,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: theme.buttonSecondaryText,
    fontSize: 16,
    fontWeight: '600',
  },
});
