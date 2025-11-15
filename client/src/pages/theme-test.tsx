import React from 'react';
import { useTheme } from '@/contexts/theme-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  ThemeSafeContainer, 
  ThemeSafeCard, 
  ThemeSafeText, 
  ThemeSafeButton,
  ThemeSafeHeader,
  ThemeDebugger,
  THEME_SAFE_MAPPINGS,
  convertToThemeSafe 
} from '@/components/ui/theme-safe-v2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Palette, CheckCircle, AlertCircle, Eye, EyeOff, Lightbulb } from 'lucide-react';

export default function ThemeTestPage() {
  const { theme } = useTheme();
  
  // Test cases to demonstrate the fixes
  const testCases = [
    {
      title: 'Headers & Navigation',
      problems: ['text-white on light backgrounds', 'invisible brand text'],
      solutions: ['text-gray-900 dark:text-white', 'proper contrast ratios'],
      status: 'fixed'
    },
    {
      title: 'Form Inputs',
      problems: ['text-white in light theme inputs', 'bg-gray-700 always dark'],
      solutions: ['text-gray-900 dark:text-white', 'bg-white dark:bg-gray-700'],
      status: 'fixed'
    },
    {
      title: 'Card Components', 
      problems: ['bg-dark-secondary hardcoded', 'text-gray-300 always gray'],
      solutions: ['bg-white dark:bg-gray-800', 'text-gray-900 dark:text-gray-100'],
      status: 'partial'
    },
    {
      title: 'Buttons & CTAs',
      problems: ['bg-blue-600 text-white only', 'hover states broken'],
      solutions: ['semantic color system', 'proper state management'],
      status: 'fixed'
    }
  ];

  const colorDemos = [
    { name: 'Primary Text', old: 'text-white', new: THEME_SAFE_MAPPINGS.text.primary },
    { name: 'Secondary Text', old: 'text-gray-300', new: THEME_SAFE_MAPPINGS.text.secondary },
    { name: 'Muted Text', old: 'text-gray-400', new: THEME_SAFE_MAPPINGS.text.muted },
    { name: 'Primary Background', old: 'bg-white', new: THEME_SAFE_MAPPINGS.bg.primary },
    { name: 'Secondary Background', old: 'bg-gray-800', new: THEME_SAFE_MAPPINGS.bg.secondary },
    { name: 'Border Color', old: 'border-gray-200', new: THEME_SAFE_MAPPINGS.border.primary }
  ];

  return (
    <ThemeSafeContainer>
      <ThemeSafeHeader className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Palette className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <ThemeSafeText variant="primary" size="3xl" className="font-bold">
                Theme System Test
              </ThemeSafeText>
              <ThemeSafeText variant="muted" size="base">
                Current Theme: <Badge variant={theme === 'dark' ? 'default' : 'secondary'}>{theme}</Badge>
              </ThemeSafeText>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </ThemeSafeHeader>

      <div className="p-6 space-y-8">
        {/* Theme Switch Demo */}
        <ThemeSafeCard variant="elevated">
          <div className="flex items-center gap-4 mb-4">
            <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            <ThemeSafeText variant="primary" size="xl" className="font-semibold">
              Live Theme Switching Demo
            </ThemeSafeText>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={THEME_SAFE_MAPPINGS.bg.primary}>
              <CardContent className="p-4">
                <ThemeSafeText variant="primary" className="font-medium">Primary Card</ThemeSafeText>
                <ThemeSafeText variant="muted" size="sm">This card adapts to theme changes</ThemeSafeText>
              </CardContent>
            </Card>
            
            <Card className={THEME_SAFE_MAPPINGS.bg.secondary}>
              <CardContent className="p-4">
                <ThemeSafeText variant="primary" className="font-medium">Secondary Card</ThemeSafeText>
                <ThemeSafeText variant="muted" size="sm">Background changes automatically</ThemeSafeText>
              </CardContent>
            </Card>
            
            <Card className={THEME_SAFE_MAPPINGS.bg.tertiary}>
              <CardContent className="p-4">
                <ThemeSafeText variant="primary" className="font-medium">Tertiary Card</ThemeSafeText>
                <ThemeSafeText variant="muted" size="sm">Text remains readable</ThemeSafeText>
              </CardContent>
            </Card>
          </div>
        </ThemeSafeCard>

        {/* Problem Analysis */}
        <ThemeSafeCard variant="outlined">
          <div className="mb-6">
            <ThemeSafeText variant="primary" size="xl" className="font-semibold mb-2">
              Theme Issues Analysis
            </ThemeSafeText>
            <ThemeSafeText variant="muted">
              Here's what was broken and how we fixed it:
            </ThemeSafeText>
          </div>
          
          <div className="grid gap-4">
            {testCases.map((testCase, index) => (
              <Card key={index} className={`${THEME_SAFE_MAPPINGS.bg.secondary} border ${THEME_SAFE_MAPPINGS.border.primary}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`${THEME_SAFE_MAPPINGS.text.primary} text-lg`}>
                      {testCase.title}
                    </CardTitle>
                    <Badge 
                      variant={testCase.status === 'fixed' ? 'default' : testCase.status === 'partial' ? 'secondary' : 'destructive'}
                      className="flex items-center gap-1"
                    >
                      {testCase.status === 'fixed' ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {testCase.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <ThemeSafeText variant="danger" className="font-medium mb-2 flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Problems
                      </ThemeSafeText>
                      <ul className="space-y-1">
                        {testCase.problems.map((problem, i) => (
                          <li key={i} className={`${THEME_SAFE_MAPPINGS.text.muted} text-sm`}>
                            • {problem}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <ThemeSafeText variant="success" className="font-medium mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Solutions
                      </ThemeSafeText>
                      <ul className="space-y-1">
                        {testCase.solutions.map((solution, i) => (
                          <li key={i} className={`${THEME_SAFE_MAPPINGS.text.muted} text-sm`}>
                            • {solution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ThemeSafeCard>

        {/* Color Mapping Demo */}
        <ThemeSafeCard variant="default">
          <ThemeSafeText variant="primary" size="xl" className="font-semibold mb-4">
            Color Mapping Transformations
          </ThemeSafeText>
          
          <div className="grid gap-3">
            {colorDemos.map((demo, index) => (
              <div key={index} className={`p-4 rounded border ${THEME_SAFE_MAPPINGS.border.primary} ${THEME_SAFE_MAPPINGS.bg.secondary}`}>
                <div className="flex items-center justify-between">
                  <ThemeSafeText variant="primary" className="font-medium">
                    {demo.name}
                  </ThemeSafeText>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className={`px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded`}>
                      {demo.old}
                    </span>
                    <span className={`${THEME_SAFE_MAPPINGS.text.muted}`}>→</span>
                    <span className={`px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded`}>
                      {demo.new}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ThemeSafeCard>

        {/* Button Variants Demo */}
        <ThemeSafeCard variant="outlined">
          <ThemeSafeText variant="primary" size="xl" className="font-semibold mb-4">
            Theme-Safe Button Variants
          </ThemeSafeText>
          
          <div className="flex flex-wrap gap-3">
            <ThemeSafeButton variant="primary">Primary Button</ThemeSafeButton>
            <ThemeSafeButton variant="secondary">Secondary Button</ThemeSafeButton>
            <ThemeSafeButton variant="ghost">Ghost Button</ThemeSafeButton>
            <ThemeSafeButton variant="surface">Surface Button</ThemeSafeButton>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
            <ThemeSafeText variant="primary" className="text-sm">
              ✨ All buttons automatically adapt their colors based on the current theme without manual intervention!
            </ThemeSafeText>
          </div>
        </ThemeSafeCard>

        {/* Implementation Guide */}
        <ThemeSafeCard variant="elevated">
          <ThemeSafeText variant="primary" size="xl" className="font-semibold mb-4">
            Implementation Guide
          </ThemeSafeText>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
              <ThemeSafeText variant="primary" className="font-medium mb-2">
                1. Replace hardcoded colors with semantic classes:
              </ThemeSafeText>
              <code className="block text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded border">
                {`// Instead of: text-white bg-gray-900\n// Use: ${THEME_SAFE_MAPPINGS.text.primary} ${THEME_SAFE_MAPPINGS.bg.primary}`}
              </code>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
              <ThemeSafeText variant="primary" className="font-medium mb-2">
                2. Use ThemeProvider and useTheme hook:
              </ThemeSafeText>
              <code className="block text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded border">
                {`const { theme, toggleTheme } = useTheme();`}
              </code>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded">
              <ThemeSafeText variant="primary" className="font-medium mb-2">
                3. Leverage theme-safe components:
              </ThemeSafeText>
              <code className="block text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded border">
                {`<ThemeSafeCard><ThemeSafeText>Content</ThemeSafeText></ThemeSafeCard>`}
              </code>
            </div>
          </div>
        </ThemeSafeCard>
      </div>
      
      <ThemeDebugger />
    </ThemeSafeContainer>
  );
}