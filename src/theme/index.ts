export const theme = {
  text: {
    primary: 'text-primary',
    secondary: 'text-secondary',
    brand: 'text-primary',
    muted: 'text-muted',
    white: 'text-white',
  },
  
  // Background classes
  bg: {
    primary: 'bg-primary',
    light: 'bg-bg-light',
    white: 'bg-white',
    navActive: 'bg-primary',
  },
  
  // Button classes - blue theme
  button: {
    primary: 'bg-primary hover:bg-accent text-white',
    secondary: 'bg-lite-gray border border-border-default text-text-primary hover:bg-gray',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-primary hover:bg-primary-50',
    custom: '',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  },
  
  // Input classes - custom border color
  input: {
    default: 'border-border-default focus:border-primary focus:ring-primary/20',
    error: 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
  },
  
  // Border classes
  border: {
    default: 'border-border-default',
    light: 'border-border-light',
    focus: 'border-primary',
  },
  
  // Navbar classes
  navbar: {
    active: 'bg-primary text-white',
    inactive: 'text-text-secondary hover:text-primary',
  },
} as const;

// Utility functions for theme classes
export const getTextClass = (variant: keyof typeof theme.text) => theme.text[variant];
export const getBgClass = (variant: keyof typeof theme.bg) => theme.bg[variant];
export const getButtonClass = (variant: keyof typeof theme.button) => theme.button[variant];
export const getInputClass = (variant: keyof typeof theme.input) => theme.input[variant];
export const getBorderClass = (variant: keyof typeof theme.border) => theme.border[variant];
export const getNavbarClass = (variant: keyof typeof theme.navbar) => theme.navbar[variant];

// Combined utility function
export const getThemeClass = (category: keyof typeof theme, variant: string) => {
  const categoryClasses = theme[category] as Record<string, string>;
  return categoryClasses[variant] || '';
};