// Modern Corporate Color Palette - Blue Gradient Theme
export const ModernCorporateColors = {
  // Primary Colors (from Coolors palette)
  navyBlue: '#03045e',        // Darkest blue - Primary buttons, headers
  lightGray: '#f8fafc',       // Very light background
  slateGray: '#334155',       // Dark text
  tealAccent: '#00b4d8',      // Medium blue - Highlights, icons
  white: '#FFFFFF',           // Cards, containers
  
  // Additional Shades (from the palette)
  navyBlueLight: '#023e8a',   // Dark blue
  navyBlueDark: '#03045e',    // Darkest blue
  tealAccentLight: '#48cae4', // Light blue
  tealAccentDark: '#0077b6',  // Medium dark blue
  slateGrayLight: '#64748b',  // Medium gray
  slateGrayDark: '#1e293b',   // Dark gray
  lightGrayDark: '#e2e8f0',   // Light gray border
  
  // Status Colors (complementary to blue theme)
  success: '#10b981',         // Green
  warning: '#f59e0b',         // Amber
  error: '#ef4444',           // Red
  info: '#0096c7',            // Medium blue from palette
  
  // Opacity Variants
  navyBlue10: 'rgba(3, 4, 94, 0.1)',
  navyBlue20: 'rgba(3, 4, 94, 0.2)',
  navyBlue50: 'rgba(3, 4, 94, 0.5)',
  tealAccent10: 'rgba(0, 180, 216, 0.1)',
  tealAccent20: 'rgba(0, 180, 216, 0.2)',
  tealAccent50: 'rgba(0, 180, 216, 0.5)',
  
  // Additional palette colors
  blueGradient1: '#03045e',   // Darkest
  blueGradient2: '#023e8a',   // Dark
  blueGradient3: '#0077b6',   // Medium dark
  blueGradient4: '#0096c7',   // Medium
  blueGradient5: '#00b4d8',   // Light
  blueGradient6: '#48cae4',   // Lighter
  blueGradient7: '#90e0ef',   // Very light
  blueGradient8: '#ade8f4',   // Pale
  blueGradient9: '#caf0f8',   // Lightest
} as const;

// Semantic Color Mappings
export const ModernCorporateTheme = {
  // Background
  background: {
    primary: ModernCorporateColors.lightGray,
    secondary: ModernCorporateColors.white,
    tertiary: ModernCorporateColors.lightGrayDark,
  },
  
  // Text
  text: {
    primary: ModernCorporateColors.slateGray,
    secondary: ModernCorporateColors.slateGrayLight,
    inverse: ModernCorporateColors.white,
  },
  
  // Interactive Elements
  button: {
    primary: ModernCorporateColors.navyBlue,
    primaryHover: ModernCorporateColors.navyBlueLight,
    secondary: ModernCorporateColors.tealAccent,
    secondaryHover: ModernCorporateColors.tealAccentLight,
  },
  
  // Borders
  border: {
    primary: ModernCorporateColors.lightGrayDark,
    secondary: ModernCorporateColors.slateGrayLight,
    accent: ModernCorporateColors.tealAccent,
  },
  
  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgba(3, 4, 94, 0.05)',
    md: '0 4px 6px -1px rgba(3, 4, 94, 0.1), 0 2px 4px -1px rgba(3, 4, 94, 0.06)',
    lg: '0 10px 15px -3px rgba(3, 4, 94, 0.1), 0 4px 6px -2px rgba(3, 4, 94, 0.05)',
    xl: '0 20px 25px -5px rgba(3, 4, 94, 0.1), 0 10px 10px -5px rgba(3, 4, 94, 0.04)',
  },
  
  // Status Colors
  status: {
    success: ModernCorporateColors.success,
    warning: ModernCorporateColors.warning,
    error: ModernCorporateColors.error,
    info: ModernCorporateColors.info,
  },
} as const;

// Type definitions
export type ModernCorporateColorKey = keyof typeof ModernCorporateColors;
export type ModernCorporateThemeKey = keyof typeof ModernCorporateTheme;

// Utility function to get color with opacity
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Utility function to get theme color
export const getThemeColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = ModernCorporateTheme;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      throw new Error(`Theme color not found: ${path}`);
    }
  }
  
  return value;
};

// Export default for convenience
export default ModernCorporateColors; 