import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const saved = localStorage.getItem('theme') as Theme;
      if (saved === 'light' || saved === 'dark') return saved;
      
      // Fallback to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme class
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Update CSS custom properties for immediate effect
    if (theme === 'dark') {
      root.style.colorScheme = 'dark';
    } else {
      root.style.colorScheme = 'light';
    }
    
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme-aware hook for getting current theme colors
export function useThemeColors() {
  const { theme } = useTheme();
  
  const colors = {
    background: theme === 'dark' ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)',
    foreground: theme === 'dark' ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
    primary: theme === 'dark' ? 'hsl(217.2 91.2% 59.8%)' : 'hsl(221.2 83.2% 53.3%)',
    muted: theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(210 40% 96%)',
    mutedForeground: theme === 'dark' ? 'hsl(215 20.2% 65.1%)' : 'hsl(215.4 16.3% 46.9%)',
    card: theme === 'dark' ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)',
    cardForeground: theme === 'dark' ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
    border: theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)',
    input: theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)',
    accent: theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(210 40% 96%)',
    accentForeground: theme === 'dark' ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
  };
  
  return { colors, theme };
}