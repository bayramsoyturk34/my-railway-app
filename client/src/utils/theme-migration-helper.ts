// utils/theme-migration-helper.ts
/**
 * Tema güvenli Tailwind class dönüşüm yardımcısı
 * Bu dosya tema güvenli renklere geçiş için kullanılabilir
 */

// Hardcoded renklerden tema güvenli renklere dönüşüm tablosu
export const COLOR_MIGRATION_MAP = {
  // Text colors
  'text-white': 'text-foreground dark:text-white',
  'text-black': 'text-foreground',
  'text-gray-100': 'text-foreground dark:text-gray-100',
  'text-gray-900': 'text-gray-900 dark:text-white',
  'text-gray-400': 'text-muted-foreground',
  'text-gray-300': 'text-muted-foreground dark:text-gray-300',
  'text-gray-600': 'text-muted-foreground',
  
  // Background colors
  'bg-white': 'bg-background',
  'bg-gray-900': 'bg-background',
  'bg-gray-800': 'bg-card',
  'bg-gray-700': 'bg-input',
  'bg-gray-100': 'bg-muted',
  'bg-dark-primary': 'bg-background',
  'bg-dark-secondary': 'bg-card',
  'bg-dark-accent': 'bg-accent',
  
  // Border colors
  'border-gray-200': 'border-border',
  'border-gray-700': 'border-border',
  'border-gray-600': 'border-border',
  'border-dark-accent': 'border-border',
  
  // Button colors
  'bg-blue-600 text-white': 'bg-primary text-primary-foreground',
  'bg-blue-500 text-white': 'bg-primary text-primary-foreground',
  'bg-green-600 text-white': 'bg-green-600 text-primary-foreground',
  'hover:bg-blue-700': 'hover:bg-primary/90',
  'hover:bg-blue-600': 'hover:bg-primary/90',
  'hover:bg-gray-700': 'hover:bg-accent',
  'hover:text-white': 'hover:text-foreground',
} as const;

// Tema güvenli renk yardımcısı fonksiyonu
export function getThemeSafeColor(originalClass: string): string {
  return COLOR_MIGRATION_MAP[originalClass as keyof typeof COLOR_MIGRATION_MAP] || originalClass;
}

// Birden fazla class'ı dönüştürme
export function migrateClasses(classString: string): string {
  return classString
    .split(' ')
    .map(cls => getThemeSafeColor(cls))
    .join(' ');
}

// Yaygın kullanım durumları için hazır şablonlar
export const THEME_SAFE_PATTERNS = {
  // Header patterns
  headerText: 'text-foreground dark:text-white',
  headerIcon: 'text-foreground dark:text-white',
  headerBrand: 'text-primary',
  
  // Card patterns
  cardBg: 'bg-card',
  cardText: 'text-card-foreground',
  cardBorder: 'border-border',
  
  // Button patterns
  primaryButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondaryButton: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghostButton: 'text-foreground hover:bg-accent hover:text-accent-foreground',
  
  // Input patterns
  input: 'bg-input border-border text-foreground placeholder:text-muted-foreground',
  
  // Navigation patterns
  navText: 'text-muted-foreground hover:text-foreground',
  navActive: 'text-foreground bg-accent',
  
  // Status patterns
  mutedText: 'text-muted-foreground',
  accentText: 'text-accent-foreground',
  destructiveText: 'text-destructive-foreground',
} as const;

// Bileşen için tema güvenli class builder
export function buildThemeSafeClasses(patterns: (keyof typeof THEME_SAFE_PATTERNS)[]): string {
  return patterns.map(pattern => THEME_SAFE_PATTERNS[pattern]).join(' ');
}

// Kullanım örneği:
/*
// Eski yöntem
<button className="bg-blue-600 text-white hover:bg-blue-700">
  Primary Button
</button>

// Yeni yöntem
<button className={buildThemeSafeClasses(['primaryButton'])}>
  Primary Button
</button>

// Veya direkt:
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Button
</button>
*/