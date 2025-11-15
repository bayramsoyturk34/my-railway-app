// components/ui/theme-safe-components.tsx
import React from 'react';
import { cn } from '@/lib/utils';

// Theme-safe Button component with variants
interface ThemeSafeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'surface';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const ThemeSafeButton: React.FC<ThemeSafeButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'text-nav-text hover:bg-surface-hover hover:text-nav-text-hover',
    surface: 'bg-surface text-foreground hover:bg-surface-hover',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// Theme-safe Card component
interface ThemeSafeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
}

export const ThemeSafeCard: React.FC<ThemeSafeCardProps> = ({ 
  children, 
  padding = 'md', 
  className, 
  ...props 
}) => {
  const baseClasses = 'bg-card text-card-foreground border border-border rounded-lg';
  
  const paddings = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  return (
    <div
      className={cn(
        baseClasses,
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Theme-safe Layout Section
interface ThemeSafeLayoutSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  background?: 'default' | 'muted' | 'surface';
}

export const ThemeSafeLayoutSection: React.FC<ThemeSafeLayoutSectionProps> = ({ 
  children, 
  background = 'default', 
  className, 
  ...props 
}) => {
  const backgrounds = {
    default: 'bg-background text-foreground',
    muted: 'bg-muted text-muted-foreground',
    surface: 'bg-surface text-foreground',
  };
  
  return (
    <section
      className={cn(
        backgrounds[background],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
};

// Theme-safe Text components
export const ThemeSafeHeading: React.FC<React.HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }> = ({ 
  level = 2, 
  className, 
  children, 
  ...props 
}) => {
  const Tag = `h${level}` as const;
  return (
    <Tag
      className={cn(
        'text-foreground font-semibold',
        level === 1 && 'text-3xl',
        level === 2 && 'text-2xl',
        level === 3 && 'text-xl',
        level === 4 && 'text-lg',
        level === 5 && 'text-base',
        level === 6 && 'text-sm',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};

export const ThemeSafeText: React.FC<React.HTMLAttributes<HTMLParagraphElement> & { variant?: 'body' | 'muted' | 'small' }> = ({ 
  variant = 'body', 
  className, 
  children, 
  ...props 
}) => {
  const variants = {
    body: 'text-foreground',
    muted: 'text-muted-foreground',
    small: 'text-muted-foreground text-sm',
  };
  
  return (
    <p
      className={cn(
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

// Usage examples in comments:

/* 
// Example Header Usage:
<header className="bg-background border-b border-border">
  <ThemeSafeButton variant="ghost">
    <Menu className="text-header-icon" />
  </ThemeSafeButton>
  
  <h1 className="text-header-brand font-bold">puantroplus</h1>
  
  <div className="flex gap-2">
    <ThemeSafeButton variant="ghost" size="sm">
      <Bell className="text-header-icon" />
    </ThemeSafeButton>
  </div>
</header>

// Example Layout Section:
<ThemeSafeLayoutSection background="muted">
  <ThemeSafeCard>
    <ThemeSafeHeading level={3}>Dashboard</ThemeSafeHeading>
    <ThemeSafeText variant="muted">Welcome to your dashboard</ThemeSafeText>
  </ThemeSafeCard>
</ThemeSafeLayoutSection>

// Example conditional class usage:
const isDarkMode = document.documentElement.classList.contains('dark');
<button className={cn(
  'transition-colors',
  isDarkMode ? 'text-white hover:text-blue-400' : 'text-gray-800 hover:text-blue-600'
)}>
  Theme-aware button
</button>
*/