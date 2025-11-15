import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';

// Theme-safe class mapping utility
export const getThemeSafeClasses = (classes: {
  light: string;
  dark: string;
  base?: string;
}) => {
  const { base = '', light, dark } = classes;
  return cn(
    base,
    light, // Default classes for light mode
    `dark:${dark.split(' ').map(c => c.replace(/^(bg-|text-|border-)/, '')).join(' dark:')}`
  );
};

// Comprehensive color mapping for theme safety
export const THEME_SAFE_MAPPINGS = {
  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-700 dark:text-gray-200', 
    muted: 'text-gray-600 dark:text-gray-400',
    inverse: 'text-white dark:text-gray-900',
    accent: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400'
  },
  
  // Background colors  
  bg: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    tertiary: 'bg-gray-100 dark:bg-gray-700',
    accent: 'bg-blue-50 dark:bg-blue-900/20',
    success: 'bg-green-50 dark:bg-green-900/20',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20',
    danger: 'bg-red-50 dark:bg-red-900/20'
  },
  
  // Border colors
  border: {
    primary: 'border-gray-200 dark:border-gray-700',
    secondary: 'border-gray-300 dark:border-gray-600',
    accent: 'border-blue-200 dark:border-blue-700',
    success: 'border-green-200 dark:border-green-700',
    warning: 'border-yellow-200 dark:border-yellow-700',
    danger: 'border-red-200 dark:border-red-700'
  }
};

// Theme-safe Button variants
export const buttonVariants = {
  primary: cn(
    'bg-blue-600 text-white border-blue-600',
    'hover:bg-blue-700 hover:border-blue-700',
    'dark:bg-blue-500 dark:border-blue-500',
    'dark:hover:bg-blue-600 dark:hover:border-blue-600',
    'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'dark:focus:ring-offset-gray-800'
  ),
  secondary: cn(
    'bg-gray-100 text-gray-900 border-gray-200',
    'hover:bg-gray-200 hover:border-gray-300',
    'dark:bg-gray-700 dark:text-white dark:border-gray-600',
    'dark:hover:bg-gray-600 dark:hover:border-gray-500'
  ),
  ghost: cn(
    'bg-transparent text-gray-700 border-transparent',
    'hover:bg-gray-100 hover:text-gray-900',
    'dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
  ),
  surface: cn(
    'bg-white text-gray-900 border-gray-200',
    'hover:bg-gray-50',
    'dark:bg-gray-800 dark:text-white dark:border-gray-600',
    'dark:hover:bg-gray-700'
  )
};

// Theme-safe Card component
export interface ThemeSafeCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
}

export function ThemeSafeCard({ children, variant = 'default', className = '' }: ThemeSafeCardProps) {
  const baseClasses = cn(
    'rounded-lg transition-colors duration-200',
    THEME_SAFE_MAPPINGS.bg.primary,
    THEME_SAFE_MAPPINGS.text.primary
  );
  
  const variantClasses = {
    default: cn(baseClasses, 'p-6'),
    elevated: cn(
      baseClasses, 
      'p-6 shadow-md dark:shadow-lg',
      'shadow-gray-200/50 dark:shadow-black/20'
    ),
    outlined: cn(
      baseClasses, 
      'p-6 border',
      THEME_SAFE_MAPPINGS.border.primary
    )
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      {children}
    </div>
  );
}

// Theme-safe Container component
export interface ThemeSafeContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'surface';
  className?: string;
}

export function ThemeSafeContainer({ children, variant = 'default', className = '' }: ThemeSafeContainerProps) {
  const variants = {
    default: THEME_SAFE_MAPPINGS.bg.primary,
    muted: THEME_SAFE_MAPPINGS.bg.secondary,
    surface: THEME_SAFE_MAPPINGS.bg.tertiary
  };

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-200',
      variants[variant],
      THEME_SAFE_MAPPINGS.text.primary,
      className
    )}>
      {children}
    </div>
  );
}

// Theme-safe Text components
export interface ThemeSafeTextProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'muted' | 'accent';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

export function ThemeSafeText({ 
  children, 
  variant = 'primary', 
  size = 'base', 
  className = '' 
}: ThemeSafeTextProps) {
  const textVariants = {
    primary: THEME_SAFE_MAPPINGS.text.primary,
    secondary: THEME_SAFE_MAPPINGS.text.secondary,
    muted: THEME_SAFE_MAPPINGS.text.muted,
    accent: THEME_SAFE_MAPPINGS.text.accent
  };

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  return (
    <span className={cn(
      textVariants[variant],
      sizes[size],
      'transition-colors duration-200',
      className
    )}>
      {children}
    </span>
  );
}

// Theme-safe Button component
export interface ThemeSafeButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'surface';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ThemeSafeButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false
}: ThemeSafeButtonProps) {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-md font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        buttonVariants[variant],
        sizes[size],
        disabled && disabledClasses,
        className
      )}
    >
      {children}
    </button>
  );
}

// Theme-safe Header component for layout
export interface ThemeSafeHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemeSafeHeader({ children, className = '' }: ThemeSafeHeaderProps) {
  return (
    <header className={cn(
      'border-b transition-colors duration-200',
      THEME_SAFE_MAPPINGS.bg.primary,
      THEME_SAFE_MAPPINGS.text.primary,
      THEME_SAFE_MAPPINGS.border.primary,
      className
    )}>
      {children}
    </header>
  );
}

// Theme debugging component
export function ThemeDebugger() {
  const { theme } = useTheme();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 p-3 rounded-lg shadow-lg border text-xs font-mono',
      THEME_SAFE_MAPPINGS.bg.secondary,
      THEME_SAFE_MAPPINGS.text.primary,
      THEME_SAFE_MAPPINGS.border.primary
    )}>
      <div>Current Theme: <strong>{theme}</strong></div>
      <div>HTML Class: <strong>{document.documentElement.className}</strong></div>
    </div>
  );
}

// Utility function to convert old hardcoded classes to theme-safe ones
export function convertToThemeSafe(oldClasses: string): string {
  return oldClasses
    .replace(/text-white/g, THEME_SAFE_MAPPINGS.text.primary)
    .replace(/text-black/g, THEME_SAFE_MAPPINGS.text.primary)
    .replace(/text-gray-100/g, THEME_SAFE_MAPPINGS.text.secondary)
    .replace(/text-gray-300/g, THEME_SAFE_MAPPINGS.text.muted)
    .replace(/text-gray-400/g, THEME_SAFE_MAPPINGS.text.muted)
    .replace(/text-gray-600/g, THEME_SAFE_MAPPINGS.text.muted)
    .replace(/bg-white/g, THEME_SAFE_MAPPINGS.bg.primary)
    .replace(/bg-gray-800/g, THEME_SAFE_MAPPINGS.bg.secondary)
    .replace(/bg-gray-900/g, THEME_SAFE_MAPPINGS.bg.primary)
    .replace(/bg-gray-700/g, THEME_SAFE_MAPPINGS.bg.tertiary)
    .replace(/border-gray-200/g, THEME_SAFE_MAPPINGS.border.primary)
    .replace(/border-gray-600/g, THEME_SAFE_MAPPINGS.border.primary)
    .replace(/border-gray-700/g, THEME_SAFE_MAPPINGS.border.primary);
}