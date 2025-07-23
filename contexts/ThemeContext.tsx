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
  background: '#f8f9ff',
  surface: '#ffffff',
  surfaceSecondary: '#f8f9ff',
  
  // Text colors
  text: '#2d3748',
  textSecondary: '#4a5568',
  textTertiary: '#718096',
  
  // Primary colors
  primary: '#667eea',
  primaryLight: '#90cdf4',
  success: '#48bb78',
  
  // UI element colors
  border: '#e2e8f0',
  shadow: '#000000',
  
  // Tab colors
  tabBackground: '#ffffff',
  tabBorder: '#e2e8f0',
  tabActive: '#667eea',
  tabInactive: '#a0aec0',
  
  // Button colors
  buttonSecondary: '#e2e8f0',
  buttonSecondaryText: '#4a5568',
  buttonDisabled: '#cbd5e0',
  buttonDisabledText: '#a0aec0',
};

// Dark theme colors
export const darkTheme = {
  // Background colors
  background: '#1a202c',
  surface: '#2d3748',
  surfaceSecondary: '#4a5568',
  
  // Text colors
  text: '#f7fafc',
  textSecondary: '#e2e8f0',
  textTertiary: '#cbd5e0',
  
  // Primary colors
  primary: '#90cdf4',
  primaryLight: '#bee3f8',
  success: '#68d391',
  
  // UI element colors
  border: '#4a5568',
  shadow: '#000000',
  
  // Tab colors
  tabBackground: '#2d3748',
  tabBorder: '#4a5568',
  tabActive: '#90cdf4',
  tabInactive: '#718096',
  
  // Button colors
  buttonSecondary: '#4a5568',
  buttonSecondaryText: '#e2e8f0',
  buttonDisabled: '#2d3748',
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
