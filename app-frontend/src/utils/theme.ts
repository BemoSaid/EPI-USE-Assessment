// src/utils/theme.ts
export const THEME_COLORS = {
  // Primary Colors
  primary: '#5F9EA0',       
  primaryHover: '#6FB7B7',   
  primaryDark: '#3A6F6F',   
  
  // Background Colors
  cardBg: '#F0F9F9',         
  darkBg: 'from-gray-900 via-gray-800 to-gray-900', 
  
  // Border Colors
  border: '#B2D8D8',        
  
  // Text Colors
  textPrimary: '#3A6F6F',  
  textSecondary: '#5F9EA0', 
  textMuted: '#B2D8D8',    
  
  // Status Colors
  success: '#6FB7B7',
  error: '#dc2626',
  warning: '#f59e0b',
} as const;

export const THEME_CLASSES = {
  // Button Classes
  primaryButton: 'bg-[#5F9EA0] hover:bg-[#6FB7B7] text-white',
  outlineButton: 'border-2 border-[#B2D8D8] text-[#3A6F6F] hover:bg-[#F0F9F9]',
  
  // Card Classes
  card: 'bg-[#F0F9F9] border-2 border-[#B2D8D8] rounded-2xl',
  
  // Input Classes
  input: 'border-2 border-[#B2D8D8] focus:border-[#5F9EA0] focus:ring-[#5F9EA0]',
  
  // Background Classes
  darkBg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
  lightBg: 'bg-[#F0F9F9]',
} as const;