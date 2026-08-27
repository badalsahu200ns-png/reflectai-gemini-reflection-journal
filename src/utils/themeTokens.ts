/**
 * ReflectAI Design Tokens & Color Role System
 * 
 * Strict Single Source of Truth for ReflectAI:
 * - primaryBrand: #76B900 (Bright Green)
 * - headingPrimary: #1A1A1A (H1)
 * - headingSecondary: #333333 (H2)
 * - integration: #2176FF (Seamless Integration, Slack, Discord, Google Services, Sync, Photo)
 * - collaboration: #F4B400 (Team Collaboration, Mood)
 * - secureData: #17DBCF (Secure Data, Privacy Center, Vault, Voice, Personal Context)
 * - reports: #595959 (Daily/Weekly/Monthly Reports, Analytics, Pattern Recognition, Dates)
 * - primaryAction: #F44336 (Red Primary Button / CTA / Save / Ask / Connect / Confirm)
 * - outlineAction: #8BC34A (Light Green Outline Button / Secondary / Cancel / View / Configure)
 * - headerBrand: #76B900
 * - headerAction: #F44336
 * - headerSpecial: #9C27B0 (AI Action / Special / Reflection / Ask My Journal)
 * 
 * Digital Brand Palette:
 * - paletteCyan: #00BCD4 (Location / Secondary Technology)
 * - paletteLime: #CDDC39 (Secondary Data Categories / Themes)
 * - paletteAmber: #FFC107 (Scan / OCR / Warnings)
 * - paletteBrown: #795548 (Secondary Decorative / Categories)
 * - paletteDark: #212121 (Deep UI Elements / Settings)
 * (Note: #FD650 is an invalid 5-digit hex code and is purposefully omitted per specification)
 */

export const THEME_TOKENS = {
  // 1. Primary Brand Canvas & Highlights
  primaryBrand: '#76B900',
  brandGreen: '#76B900',
  brandGreenLight: '#8FE000',
  brandGreenDark: '#5E9400',

  // 2. Headings
  headingPrimary: '#1A1A1A',
  headingSecondary: '#333333',
  headingPrimaryDark: '#F5F5F5',
  headingSecondaryDark: '#D4D4D4',

  // 3. Feature Icons & Semantics
  integration: '#2176FF',     // Seamless Integration, Sync, Slack, Discord, Photo
  collaboration: '#F4B400',   // Team Collaboration, Mood
  secureData: '#17DBCF',      // Privacy Center, Vault, Encryption, Voice, Personal Context
  reports: '#595959',         // Daily/Weekly/Monthly Reports, Analytics, Pattern Recognition

  // 4. Buttons & Actions
  primaryAction: '#F44336',    // Primary Action CTA (Red with white text)
  primaryActionHover: '#D32F2F',
  outlineAction: '#8BC34A',    // Outline Action (Light Green border & text)
  outlineActionHover: 'rgba(139, 195, 74, 0.12)',

  // 5. Header Action Colors
  headerBrand: '#76B900',
  headerAction: '#F44336',
  headerSpecial: '#9C27B0',    // AI Special Actions

  // 6. AI & Special Features
  aiSpecial: '#9C27B0',       // AI Reflection, Ask My Journal, AI Pattern

  // 7. Digital Brand Palette
  paletteCyan: '#00BCD4',     // Location / Google Maps / Secondary Tech
  paletteLime: '#CDDC39',     // Secondary Categories / Themes
  paletteAmber: '#FFC107',    // Scan / OCR / Warnings
  paletteBrown: '#795548',    // Secondary Decorative
  paletteDark: '#212121',     // Deep UI / Settings

  // 8. Notifications & Status
  statusSuccess: '#76B900',
  statusInfo: '#2176FF',
  statusAI: '#9C27B0',
  statusWarning: '#FFC107',
  statusError: '#F44336',
  statusSecurity: '#17DBCF'
} as const;

// CSS Classes Helpers for Easy, Uniform Component Styling
export const BTN_CLASSES = {
  primary: 'bg-[#F44336] hover:bg-[#D32F2F] text-white font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
  outline: 'border border-[#8BC34A] text-[#8BC34A] hover:bg-[#8BC34A]/10 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
  brand: 'bg-[#76B900] hover:bg-[#8FE000] text-black font-bold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
  ai: 'bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
  darkNeutral: 'bg-[#212121] hover:bg-[#333333] text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'
} as const;

export const ICON_COLORS = {
  integration: '#2176FF',
  collaboration: '#F4B400',
  secureData: '#17DBCF',
  reports: '#595959',
  ai: '#9C27B0',
  location: '#00BCD4',
  scan: '#FFC107',
  voice: '#17DBCF',
  photo: '#2176FF',
  settings: '#212121',
  brand: '#76B900',
  danger: '#F44336'
} as const;

export const CHART_PALETTE = [
  '#76B900', // Brand Green
  '#2176FF', // Integration Blue
  '#F4B400', // Collaboration Yellow
  '#17DBCF', // Secure Teal
  '#9C27B0', // AI Purple
  '#595959', // Reports Gray
  '#CDDC39', // Lime
  '#00BCD4', // Cyan
  '#FFC107', // Amber
  '#795548'  // Brown
];
