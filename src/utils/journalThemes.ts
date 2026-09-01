import React from 'react';
import { JournalThemeId } from '../types';

export interface ThemeColors {
  outerBg: string;
  writingPadBg: string;
  writingPadBorder: string;
  writingPadShadow: string;
  paperTextureOverlay?: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  placeholderColor: string;
  toolbarBg: string;
  toolbarBorder: string;
  toolbarText: string;
  primaryButtonBg: string;
  primaryButtonHover: string;
  primaryButtonText: string;
  primaryButtonShadow: string;
  secondaryButtonBg: string;
  secondaryButtonBorder: string;
  secondaryButtonHover: string;
  secondaryButtonText: string;
  // Convenience aliases for flexible template usage
  buttonPrimaryBg?: string;
  buttonPrimaryHover?: string;
  buttonPrimaryText?: string;
  buttonSecondaryBg?: string;
  buttonSecondaryBorder?: string;
  buttonSecondaryText?: string;
  dividerColor?: string;
  accentColor: string;
  accentBadgeBg: string;
  accentBadgeBorder: string;
  accentBadgeText: string;
  aiPanelBg: string;
  aiPanelBorder: string;
  aiPanelGlow: string;
  aiPanelText: string;
  aiPanelMuted: string;
  moodSelectorBg: string;
  moodActiveBg: string;
  moodActiveBorder: string;
  moodActiveText: string;
  tagBg: string;
  tagBorder: string;
  tagText: string;
  tagActiveBg: string;
  tagActiveBorder: string;
  inputBg: string;
  inputBorder: string;
  inputFocusRing: string;
  cardBg: string;
  cardBorder: string;
  petalColors: string[];
}

export interface JournalThemeDefinition {
  id: JournalThemeId;
  name: string;
  emoji: string;
  tagline: string;
  atmosphere: string;
  mood: string;
  description: string;
  swatches: string[];
  light: ThemeColors;
  dark: ThemeColors;
}

export const JOURNAL_THEMES: Record<JournalThemeId, JournalThemeDefinition> = {
  'rose-garden': {
    id: 'rose-garden',
    name: 'Rose Garden',
    emoji: '🌹',
    tagline: 'Romantic, peaceful & emotional warmth',
    atmosphere: 'Romantic Ivory & Rose Petals',
    mood: 'Romantic, peaceful, emotional, warm',
    description: 'Warm ivory journal paper surrounded by delicate rose blush borders and drifting crimson petals.',
    swatches: ['#F43F5E', '#FDA4AF', '#FFFDF8', '#E11D48', '#881337'],
    light: {
      outerBg: 'bg-gradient-to-br from-rose-50/80 via-pink-50/50 to-amber-50/40 text-neutral-900',
      writingPadBg: 'bg-[#FFFDF9]',
      writingPadBorder: 'border-rose-200/80',
      writingPadShadow: 'shadow-[0_15px_40px_rgba(244,63,94,0.08),0_2px_8px_rgba(0,0,0,0.03)]',
      paperTextureOverlay: 'bg-[radial-gradient(#F43F5E_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10',
      textPrimary: 'text-rose-950',
      textSecondary: 'text-rose-800/80',
      textMuted: 'text-rose-900/50',
      placeholderColor: 'placeholder:text-rose-900/40',
      toolbarBg: 'bg-rose-50/90 backdrop-blur-md',
      toolbarBorder: 'border-rose-200',
      toolbarText: 'text-rose-900',
      primaryButtonBg: 'bg-rose-600',
      primaryButtonHover: 'hover:bg-rose-700',
      primaryButtonText: 'text-white',
      primaryButtonShadow: 'shadow-[0_4px_14px_rgba(225,29,72,0.3)]',
      secondaryButtonBg: 'bg-rose-50',
      secondaryButtonBorder: 'border-rose-200',
      secondaryButtonHover: 'hover:bg-rose-100/80',
      secondaryButtonText: 'text-rose-800',
      accentColor: '#E11D48',
      accentBadgeBg: 'bg-rose-100',
      accentBadgeBorder: 'border-rose-200',
      accentBadgeText: 'text-rose-800',
      aiPanelBg: 'bg-gradient-to-b from-rose-50/90 to-pink-50/80',
      aiPanelBorder: 'border-rose-200',
      aiPanelGlow: 'shadow-[0_8px_30px_rgba(244,63,94,0.12)]',
      aiPanelText: 'text-rose-950',
      aiPanelMuted: 'text-rose-800/70',
      moodSelectorBg: 'bg-rose-50/60',
      moodActiveBg: 'bg-rose-600',
      moodActiveBorder: 'border-rose-600',
      moodActiveText: 'text-white shadow-xs',
      tagBg: 'bg-rose-50/80',
      tagBorder: 'border-rose-200',
      tagText: 'text-rose-800',
      tagActiveBg: 'bg-rose-600 text-white border-rose-600',
      tagActiveBorder: 'border-rose-600',
      inputBg: 'bg-white/80',
      inputBorder: 'border-rose-200',
      inputFocusRing: 'focus:ring-2 focus:ring-rose-400 focus:border-rose-400',
      cardBg: 'bg-white/90',
      cardBorder: 'border-rose-100',
      petalColors: ['#FB7185', '#F43F5E', '#FDA4AF', '#FECDD3']
    },
    dark: {
      outerBg: 'bg-gradient-to-br from-[#1A0C11] via-[#140A0E] to-[#1F0E16] text-rose-50',
      writingPadBg: 'bg-[#221017]',
      writingPadBorder: 'border-rose-900/60',
      writingPadShadow: 'shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_20px_rgba(225,29,72,0.15)]',
      paperTextureOverlay: 'bg-[radial-gradient(#FB7185_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-15',
      textPrimary: 'text-rose-100',
      textSecondary: 'text-rose-200/80',
      textMuted: 'text-rose-400/60',
      placeholderColor: 'placeholder:text-rose-300/40',
      toolbarBg: 'bg-[#180B10]/90 backdrop-blur-md',
      toolbarBorder: 'border-rose-900/60',
      toolbarText: 'text-rose-200',
      primaryButtonBg: 'bg-rose-600',
      primaryButtonHover: 'hover:bg-rose-500',
      primaryButtonText: 'text-white',
      primaryButtonShadow: 'shadow-[0_4px_18px_rgba(225,29,72,0.4)]',
      secondaryButtonBg: 'bg-rose-950/60',
      secondaryButtonBorder: 'border-rose-900/80',
      secondaryButtonHover: 'hover:bg-rose-900/60 hover:text-white',
      secondaryButtonText: 'text-rose-300',
      accentColor: '#FB7185',
      accentBadgeBg: 'bg-rose-950/80',
      accentBadgeBorder: 'border-rose-800/60',
      accentBadgeText: 'text-rose-300',
      aiPanelBg: 'bg-gradient-to-b from-[#25121A] to-[#1B0C13]',
      aiPanelBorder: 'border-rose-900/60',
      aiPanelGlow: 'shadow-[0_8px_32px_rgba(225,29,72,0.2)]',
      aiPanelText: 'text-rose-100',
      aiPanelMuted: 'text-rose-300/70',
      moodSelectorBg: 'bg-rose-950/40',
      moodActiveBg: 'bg-rose-600',
      moodActiveBorder: 'border-rose-500',
      moodActiveText: 'text-white shadow-xs',
      tagBg: 'bg-rose-950/50',
      tagBorder: 'border-rose-900/60',
      tagText: 'text-rose-300',
      tagActiveBg: 'bg-rose-600 text-white border-rose-500',
      tagActiveBorder: 'border-rose-500',
      inputBg: 'bg-[#180B10]/80',
      inputBorder: 'border-rose-900/70',
      inputFocusRing: 'focus:ring-2 focus:ring-rose-500 focus:border-rose-500',
      cardBg: 'bg-[#221017]/80',
      cardBorder: 'border-rose-900/50',
      petalColors: ['#F43F5E', '#FB7185', '#E11D48', '#FDA4AF']
    }
  },

  'lavender-dream': {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    emoji: '💜',
    tagline: 'Calm, dreamy, reflective & serene nightfall',
    atmosphere: 'Calm Lavender & Soft Glowing Particles',
    mood: 'Calm, dreamy, reflective, peaceful',
    description: 'Soft lavender-tinted surface, fine violet borders, and soothing weightless particles ideal for evening reflection.',
    swatches: ['#8B5CF6', '#C4B5FD', '#F5F3FF', '#6D28D9', '#311042'],
    light: {
      outerBg: 'bg-gradient-to-br from-violet-50/80 via-purple-50/50 to-indigo-50/40 text-neutral-900',
      writingPadBg: 'bg-[#FAFAFF]',
      writingPadBorder: 'border-violet-200/80',
      writingPadShadow: 'shadow-[0_15px_40px_rgba(139,92,246,0.09),0_2px_8px_rgba(0,0,0,0.03)]',
      paperTextureOverlay: 'bg-[radial-gradient(#8B5CF6_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10',
      textPrimary: 'text-violet-950',
      textSecondary: 'text-violet-800/80',
      textMuted: 'text-violet-900/50',
      placeholderColor: 'placeholder:text-violet-900/40',
      toolbarBg: 'bg-violet-50/90 backdrop-blur-md',
      toolbarBorder: 'border-violet-200',
      toolbarText: 'text-violet-900',
      primaryButtonBg: 'bg-violet-600',
      primaryButtonHover: 'hover:bg-violet-700',
      primaryButtonText: 'text-white',
      primaryButtonShadow: 'shadow-[0_4px_14px_rgba(109,40,217,0.3)]',
      secondaryButtonBg: 'bg-violet-50',
      secondaryButtonBorder: 'border-violet-200',
      secondaryButtonHover: 'hover:bg-violet-100/80',
      secondaryButtonText: 'text-violet-800',
      accentColor: '#7C3AED',
      accentBadgeBg: 'bg-violet-100',
      accentBadgeBorder: 'border-violet-200',
      accentBadgeText: 'text-violet-800',
      aiPanelBg: 'bg-gradient-to-b from-violet-50/90 to-purple-50/80',
      aiPanelBorder: 'border-violet-200',
      aiPanelGlow: 'shadow-[0_8px_30px_rgba(139,92,246,0.12)]',
      aiPanelText: 'text-violet-950',
      aiPanelMuted: 'text-violet-800/70',
      moodSelectorBg: 'bg-violet-50/60',
      moodActiveBg: 'bg-violet-600',
      moodActiveBorder: 'border-violet-600',
      moodActiveText: 'text-white shadow-xs',
      tagBg: 'bg-violet-50/80',
      tagBorder: 'border-violet-200',
      tagText: 'text-violet-800',
      tagActiveBg: 'bg-violet-600 text-white border-violet-600',
      tagActiveBorder: 'border-violet-600',
      inputBg: 'bg-white/80',
      inputBorder: 'border-violet-200',
      inputFocusRing: 'focus:ring-2 focus:ring-violet-400 focus:border-violet-400',
      cardBg: 'bg-white/90',
      cardBorder: 'border-violet-100',
      petalColors: ['#A78BFA', '#C4B5FD', '#8B5CF6', '#DDD6FE']
    },
    dark: {
      outerBg: 'bg-gradient-to-br from-[#120D1E] via-[#0E0A18] to-[#181126] text-violet-50',
      writingPadBg: 'bg-[#1A132B]',
      writingPadBorder: 'border-violet-900/60',
      writingPadShadow: 'shadow-[0_20px_60px_rgba(0,0,0,0.75),0_0_24px_rgba(139,92,246,0.15)]',
      paperTextureOverlay: 'bg-[radial-gradient(#A78BFA_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-15',
      textPrimary: 'text-violet-100',
      textSecondary: 'text-violet-200/80',
      textMuted: 'text-violet-400/60',
      placeholderColor: 'placeholder:text-violet-300/40',
      toolbarBg: 'bg-[#130E20]/90 backdrop-blur-md',
      toolbarBorder: 'border-violet-900/60',
      toolbarText: 'text-violet-200',
      primaryButtonBg: 'bg-violet-600',
      primaryButtonHover: 'hover:bg-violet-500',
      primaryButtonText: 'text-white',
      primaryButtonShadow: 'shadow-[0_4px_18px_rgba(139,92,246,0.4)]',
      secondaryButtonBg: 'bg-violet-950/60',
      secondaryButtonBorder: 'border-violet-900/80',
      secondaryButtonHover: 'hover:bg-violet-900/60 hover:text-white',
      secondaryButtonText: 'text-violet-300',
      accentColor: '#A78BFA',
      accentBadgeBg: 'bg-violet-950/80',
      accentBadgeBorder: 'border-violet-800/60',
      accentBadgeText: 'text-violet-300',
      aiPanelBg: 'bg-gradient-to-b from-[#1E1632] to-[#150F24]',
      aiPanelBorder: 'border-violet-900/60',
      aiPanelGlow: 'shadow-[0_8px_32px_rgba(139,92,246,0.22)]',
      aiPanelText: 'text-violet-100',
      aiPanelMuted: 'text-violet-300/70',
      moodSelectorBg: 'bg-violet-950/40',
      moodActiveBg: 'bg-violet-600',
      moodActiveBorder: 'border-violet-500',
      moodActiveText: 'text-white shadow-xs',
      tagBg: 'bg-violet-950/50',
      tagBorder: 'border-violet-900/60',
      tagText: 'text-violet-300',
      tagActiveBg: 'bg-violet-600 text-white border-violet-500',
      tagActiveBorder: 'border-violet-500',
      inputBg: 'bg-[#130E20]/80',
      inputBorder: 'border-violet-900/70',
      inputFocusRing: 'focus:ring-2 focus:ring-violet-500 focus:border-violet-500',
      cardBg: 'bg-[#1A132B]/80',
      cardBorder: 'border-violet-900/50',
      petalColors: ['#8B5CF6', '#A78BFA', '#7C3AED', '#C4B5FD']
    }
  },

  'sunset-bloom': {
    id: 'sunset-bloom',
    name: 'Sunset Bloom',
    emoji: '🌅',
    tagline: 'Warm, optimistic, positive & energetic',
    atmosphere: 'Warm Peach & Golden Glow',
    mood: 'Optimistic, energetic, positive, hopeful',
    description: 'Warm cream paper with soft coral accents and golden ambient light that inspires gratitude and creative momentum.',
    swatches: ['#F97316', '#FB923C', '#FFFBF5', '#EA580C', '#7C2D12'],
    light: {
      outerBg: 'bg-gradient-to-br from-orange-50/80 via-amber-50/50 to-rose-50/40 text-neutral-900',
      writingPadBg: 'bg-[#FFFDF7]',
      writingPadBorder: 'border-orange-200/80',
      writingPadShadow: 'shadow-[0_15px_40px_rgba(249,115,22,0.08),0_2px_8px_rgba(0,0,0,0.03)]',
      paperTextureOverlay: 'bg-[radial-gradient(#F97316_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10',
      textPrimary: 'text-stone-900',
      textSecondary: 'text-stone-700',
      textMuted: 'text-orange-900/50',
      placeholderColor: 'placeholder:text-orange-900/40',
      toolbarBg: 'bg-orange-50/90 backdrop-blur-md',
      toolbarBorder: 'border-orange-200',
      toolbarText: 'text-orange-950',
      primaryButtonBg: 'bg-orange-600',
      primaryButtonHover: 'hover:bg-orange-700',
      primaryButtonText: 'text-white',
      primaryButtonShadow: 'shadow-[0_4px_14px_rgba(234,88,12,0.3)]',
      secondaryButtonBg: 'bg-orange-50',
      secondaryButtonBorder: 'border-orange-200',
      secondaryButtonHover: 'hover:bg-orange-100/80',
      secondaryButtonText: 'text-orange-900',
      accentColor: '#EA580C',
      accentBadgeBg: 'bg-orange-100',
      accentBadgeBorder: 'border-orange-200',
      accentBadgeText: 'text-orange-900',
      aiPanelBg: 'bg-gradient-to-b from-orange-50/90 to-amber-50/80',
      aiPanelBorder: 'border-orange-200',
      aiPanelGlow: 'shadow-[0_8px_30px_rgba(249,115,22,0.12)]',
      aiPanelText: 'text-stone-900',
      aiPanelMuted: 'text-stone-600',
      moodSelectorBg: 'bg-orange-50/60',
      moodActiveBg: 'bg-orange-600',
      moodActiveBorder: 'border-orange-600',
      moodActiveText: 'text-white shadow-xs',
      tagBg: 'bg-orange-50/80',
      tagBorder: 'border-orange-200',
      tagText: 'text-orange-900',
      tagActiveBg: 'bg-orange-600 text-white border-orange-600',
      tagActiveBorder: 'border-orange-600',
      inputBg: 'bg-white/80',
      inputBorder: 'border-orange-200',
      inputFocusRing: 'focus:ring-2 focus:ring-orange-400 focus:border-orange-400',
      cardBg: 'bg-white/90',
      cardBorder: 'border-orange-100',
      petalColors: ['#FB923C', '#FDBA74', '#F97316', '#FDE047']
    },
    dark: {
      outerBg: 'bg-gradient-to-br from-[#1C100C] via-[#140C08] to-[#20120B] text-amber-50',
      writingPadBg: 'bg-[#241510]',
      writingPadBorder: 'border-orange-900/60',
      writingPadShadow: 'shadow-[0_20px_60px_rgba(0,0,0,0.75),0_0_20px_rgba(249,115,22,0.15)]',
      paperTextureOverlay: 'bg-[radial-gradient(#FB923C_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-15',
      textPrimary: 'text-orange-100',
      textSecondary: 'text-orange-200/80',
      textMuted: 'text-orange-400/60',
      placeholderColor: 'placeholder:text-orange-300/40',
      toolbarBg: 'bg-[#180E09]/90 backdrop-blur-md',
      toolbarBorder: 'border-orange-900/60',
      toolbarText: 'text-orange-200',
      primaryButtonBg: 'bg-orange-600',
      primaryButtonHover: 'hover:bg-orange-500',
      primaryButtonText: 'text-white',
      primaryButtonShadow: 'shadow-[0_4px_18px_rgba(249,115,22,0.4)]',
      secondaryButtonBg: 'bg-orange-950/60',
      secondaryButtonBorder: 'border-orange-900/80',
      secondaryButtonHover: 'hover:bg-orange-900/60 hover:text-white',
      secondaryButtonText: 'text-orange-300',
      accentColor: '#FB923C',
      accentBadgeBg: 'bg-orange-950/80',
      accentBadgeBorder: 'border-orange-800/60',
      accentBadgeText: 'text-orange-300',
      aiPanelBg: 'bg-gradient-to-b from-[#291712] to-[#1C0F0A]',
      aiPanelBorder: 'border-orange-900/60',
      aiPanelGlow: 'shadow-[0_8px_32px_rgba(249,115,22,0.2)]',
      aiPanelText: 'text-orange-100',
      aiPanelMuted: 'text-orange-300/70',
      moodSelectorBg: 'bg-orange-950/40',
      moodActiveBg: 'bg-orange-600',
      moodActiveBorder: 'border-orange-500',
      moodActiveText: 'text-white shadow-xs',
      tagBg: 'bg-orange-950/50',
      tagBorder: 'border-orange-900/60',
      tagText: 'text-orange-300',
      tagActiveBg: 'bg-orange-600 text-white border-orange-500',
      tagActiveBorder: 'border-orange-500',
      inputBg: 'bg-[#180E09]/80',
      inputBorder: 'border-orange-900/70',
      inputFocusRing: 'focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
      cardBg: 'bg-[#241510]/80',
      cardBorder: 'border-orange-900/50',
      petalColors: ['#EA580C', '#F97316', '#FB923C', '#F59E0B']
    }
  },

  'sakura-breeze': {
    id: 'sakura-breeze',
    name: 'Sakura Breeze',
    emoji: '🌸',
    tagline: 'Fresh, peaceful, renewal & new beginnings',
    atmosphere: 'Cherry Blossoms & Gentle Horizon',
    mood: 'Fresh, peaceful, optimistic, new beginnings',
    description: 'Crisp clean white paper framed by delicate sakura pink borders, faint baby-blue ambient breeze, and drifting cherry blossom petals.',
    swatches: ['#EC4899', '#F472B6', '#FEFAFC', '#38BDF8', '#831843'],
    light: {
      outerBg: 'bg-gradient-to-br from-pink-50/80 via-sky-50/40 to-emerald-50/30 text-neutral-900',
      writingPadBg: 'bg-[#FEFAFD]',
      writingPadBorder: 'border-pink-200/80',
      writingPadShadow: 'shadow-[0_15px_40px_rgba(236,72,153,0.08),0_2px_8px_rgba(56,189,248,0.04)]',
      paperTextureOverlay: 'bg-[radial-gradient(#EC4899_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10',
      textPrimary: 'text-neutral-900',
      textSecondary: 'text-neutral-700',
      textMuted: 'text-pink-900/50',
      placeholderColor: 'placeholder:text-pink-900/40',
      toolbarBg: 'bg-pink-50/90 backdrop-blur-md',
      toolbarBorder: 'border-pink-200',
      toolbarText: 'text-pink-950',
      primaryButtonBg: 'bg-pink-600',
      primaryButtonHover: 'hover:bg-pink-700',
      primaryButtonText: 'text-white',
      primaryButtonShadow: 'shadow-[0_4px_14px_rgba(219,39,119,0.3)]',
      secondaryButtonBg: 'bg-pink-50',
      secondaryButtonBorder: 'border-pink-200',
      secondaryButtonHover: 'hover:bg-pink-100/80',
      secondaryButtonText: 'text-pink-900',
      accentColor: '#DB2777',
      accentBadgeBg: 'bg-pink-100',
      accentBadgeBorder: 'border-pink-200',
      accentBadgeText: 'text-pink-900',
      aiPanelBg: 'bg-gradient-to-b from-pink-50/90 to-sky-50/70',
      aiPanelBorder: 'border-pink-200',
      aiPanelGlow: 'shadow-[0_8px_30px_rgba(236,72,153,0.12)]',
      aiPanelText: 'text-neutral-900',
      aiPanelMuted: 'text-neutral-600',
      moodSelectorBg: 'bg-pink-50/60',
      moodActiveBg: 'bg-pink-600',
      moodActiveBorder: 'border-pink-600',
      moodActiveText: 'text-white shadow-xs',
      tagBg: 'bg-pink-50/80',
      tagBorder: 'border-pink-200',
      tagText: 'text-pink-900',
      tagActiveBg: 'bg-pink-600 text-white border-pink-600',
      tagActiveBorder: 'border-pink-600',
      inputBg: 'bg-white/80',
      inputBorder: 'border-pink-200',
      inputFocusRing: 'focus:ring-2 focus:ring-pink-400 focus:border-pink-400',
      cardBg: 'bg-white/90',
      cardBorder: 'border-pink-100',
      petalColors: ['#F472B6', '#FBCFE8', '#EC4899', '#BAE6FD']
    },
    dark: {
      outerBg: 'bg-gradient-to-br from-[#180E1B] via-[#0E131E] to-[#1C1021] text-pink-50',
      writingPadBg: 'bg-[#201324]',
      writingPadBorder: 'border-pink-900/60',
      writingPadShadow: 'shadow-[0_20px_60px_rgba(0,0,0,0.75),0_0_22px_rgba(236,72,153,0.15)]',
      paperTextureOverlay: 'bg-[radial-gradient(#F472B6_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-15',
      textPrimary: 'text-pink-100',
      textSecondary: 'text-pink-200/80',
      textMuted: 'text-pink-400/60',
      placeholderColor: 'placeholder:text-pink-300/40',
      toolbarBg: 'bg-[#150C18]/90 backdrop-blur-md',
      toolbarBorder: 'border-pink-900/60',
      toolbarText: 'text-pink-200',
      primaryButtonBg: 'bg-pink-600',
      primaryButtonHover: 'hover:bg-pink-500',
      primaryButtonText: 'text-white',
      primaryButtonShadow: 'shadow-[0_4px_18px_rgba(236,72,153,0.4)]',
      secondaryButtonBg: 'bg-pink-950/60',
      secondaryButtonBorder: 'border-pink-900/80',
      secondaryButtonHover: 'hover:bg-pink-900/60 hover:text-white',
      secondaryButtonText: 'text-pink-300',
      accentColor: '#F472B6',
      accentBadgeBg: 'bg-pink-950/80',
      accentBadgeBorder: 'border-pink-800/60',
      accentBadgeText: 'text-pink-300',
      aiPanelBg: 'bg-gradient-to-b from-[#26152B] to-[#161726]',
      aiPanelBorder: 'border-pink-900/60',
      aiPanelGlow: 'shadow-[0_8px_32px_rgba(236,72,153,0.2)]',
      aiPanelText: 'text-pink-100',
      aiPanelMuted: 'text-pink-300/70',
      moodSelectorBg: 'bg-pink-950/40',
      moodActiveBg: 'bg-pink-600',
      moodActiveBorder: 'border-pink-500',
      moodActiveText: 'text-white shadow-xs',
      tagBg: 'bg-pink-950/50',
      tagBorder: 'border-pink-900/60',
      tagText: 'text-pink-300',
      tagActiveBg: 'bg-pink-600 text-white border-pink-500',
      tagActiveBorder: 'border-pink-500',
      inputBg: 'bg-[#150C18]/80',
      inputBorder: 'border-pink-900/70',
      inputFocusRing: 'focus:ring-2 focus:ring-pink-500 focus:border-pink-500',
      cardBg: 'bg-[#201324]/80',
      cardBorder: 'border-pink-900/50',
      petalColors: ['#EC4899', '#F472B6', '#DB2777', '#7DD3FC']
    }
  },

  'botanical-serenity': {
    id: 'botanical-serenity',
    name: 'Botanical Serenity',
    emoji: '🌿',
    tagline: 'Natural, grounded, mindful & balanced',
    atmosphere: 'Sage Leaves & Mindful Forest Earth',
    mood: 'Natural, grounded, mindful, balanced',
    description: 'Warm cream paper framed by soft sage greens, mint undertones, and gentle drifting botanical leaves for grounded clarity.',
    swatches: ['#10B981', '#6EE7B7', '#F8FAF6', '#059669', '#064E3B'],
    light: {
      outerBg: 'bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-stone-50/40 text-neutral-900',
      writingPadBg: 'bg-[#FAFCF8]',
      writingPadBorder: 'border-emerald-200/80',
      writingPadShadow: 'shadow-[0_15px_40px_rgba(16,185,129,0.08),0_2px_8px_rgba(0,0,0,0.03)]',
      paperTextureOverlay: 'bg-[radial-gradient(#10B981_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10',
      textPrimary: 'text-emerald-950',
      textSecondary: 'text-emerald-900/80',
      textMuted: 'text-emerald-950/50',
      placeholderColor: 'placeholder:text-emerald-900/40',
      toolbarBg: 'bg-emerald-50/90 backdrop-blur-md',
      toolbarBorder: 'border-emerald-200',
      toolbarText: 'text-emerald-950',
      primaryButtonBg: 'bg-emerald-600',
      primaryButtonHover: 'hover:bg-emerald-700',
      primaryButtonText: 'text-white',
      primaryButtonShadow: 'shadow-[0_4px_14px_rgba(5,150,105,0.3)]',
      secondaryButtonBg: 'bg-emerald-50',
      secondaryButtonBorder: 'border-emerald-200',
      secondaryButtonHover: 'hover:bg-emerald-100/80',
      secondaryButtonText: 'text-emerald-900',
      accentColor: '#059669',
      accentBadgeBg: 'bg-emerald-100',
      accentBadgeBorder: 'border-emerald-200',
      accentBadgeText: 'text-emerald-900',
      aiPanelBg: 'bg-gradient-to-b from-emerald-50/90 to-teal-50/80',
      aiPanelBorder: 'border-emerald-200',
      aiPanelGlow: 'shadow-[0_8px_30px_rgba(16,185,129,0.12)]',
      aiPanelText: 'text-emerald-950',
      aiPanelMuted: 'text-emerald-900/70',
      moodSelectorBg: 'bg-emerald-50/60',
      moodActiveBg: 'bg-emerald-600',
      moodActiveBorder: 'border-emerald-600',
      moodActiveText: 'text-white shadow-xs',
      tagBg: 'bg-emerald-50/80',
      tagBorder: 'border-emerald-200',
      tagText: 'text-emerald-900',
      tagActiveBg: 'bg-emerald-600 text-white border-emerald-600',
      tagActiveBorder: 'border-emerald-600',
      inputBg: 'bg-white/80',
      inputBorder: 'border-emerald-200',
      inputFocusRing: 'focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400',
      cardBg: 'bg-white/90',
      cardBorder: 'border-emerald-100',
      petalColors: ['#34D399', '#6EE7B7', '#10B981', '#A7F3D0']
    },
    dark: {
      outerBg: 'bg-gradient-to-br from-[#0C1712] via-[#08120E] to-[#101F18] text-emerald-50',
      writingPadBg: 'bg-[#13221B]',
      writingPadBorder: 'border-emerald-900/60',
      writingPadShadow: 'shadow-[0_20px_60px_rgba(0,0,0,0.75),0_0_20px_rgba(16,185,129,0.15)]',
      paperTextureOverlay: 'bg-[radial-gradient(#34D399_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-15',
      textPrimary: 'text-emerald-100',
      textSecondary: 'text-emerald-200/80',
      textMuted: 'text-emerald-400/60',
      placeholderColor: 'placeholder:text-emerald-300/40',
      toolbarBg: 'bg-[#0E1A14]/90 backdrop-blur-md',
      toolbarBorder: 'border-emerald-900/60',
      toolbarText: 'text-emerald-200',
      primaryButtonBg: 'bg-emerald-600',
      primaryButtonHover: 'hover:bg-emerald-500',
      primaryButtonText: 'text-white',
      primaryButtonShadow: 'shadow-[0_4px_18px_rgba(16,185,129,0.4)]',
      secondaryButtonBg: 'bg-emerald-950/60',
      secondaryButtonBorder: 'border-emerald-900/80',
      secondaryButtonHover: 'hover:bg-emerald-900/60 hover:text-white',
      secondaryButtonText: 'text-emerald-300',
      accentColor: '#34D399',
      accentBadgeBg: 'bg-emerald-950/80',
      accentBadgeBorder: 'border-emerald-800/60',
      accentBadgeText: 'text-emerald-300',
      aiPanelBg: 'bg-gradient-to-b from-[#172B22] to-[#0E1D16]',
      aiPanelBorder: 'border-emerald-900/60',
      aiPanelGlow: 'shadow-[0_8px_32px_rgba(16,185,129,0.2)]',
      aiPanelText: 'text-emerald-100',
      aiPanelMuted: 'text-emerald-300/70',
      moodSelectorBg: 'bg-emerald-950/40',
      moodActiveBg: 'bg-emerald-600',
      moodActiveBorder: 'border-emerald-500',
      moodActiveText: 'text-white shadow-xs',
      tagBg: 'bg-emerald-950/50',
      tagBorder: 'border-emerald-900/60',
      tagText: 'text-emerald-300',
      tagActiveBg: 'bg-emerald-600 text-white border-emerald-500',
      tagActiveBorder: 'border-emerald-500',
      inputBg: 'bg-[#0E1A14]/80',
      inputBorder: 'border-emerald-900/70',
      inputFocusRing: 'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
      cardBg: 'bg-[#13221B]/80',
      cardBorder: 'border-emerald-900/50',
      petalColors: ['#059669', '#10B981', '#34D399', '#6EE7B7']
    }
  },

  // Backward compatible aliases
  'twilight': {
    id: 'twilight',
    name: 'Lavender Dream',
    emoji: '💜',
    tagline: 'Calm, dreamy & reflective',
    atmosphere: 'Calm Lavender & Soft Glow',
    mood: 'Calm, dreamy, reflective',
    description: 'Alias for Lavender Dream.',
    swatches: ['#8B5CF6', '#C4B5FD', '#F5F3FF', '#6D28D9', '#311042'],
    get light() { return JOURNAL_THEMES['lavender-dream'].light; },
    get dark() { return JOURNAL_THEMES['lavender-dream'].dark; }
  },
  'sepia': {
    id: 'sepia',
    name: 'Sunset Bloom',
    emoji: '🌅',
    tagline: 'Warm & optimistic',
    atmosphere: 'Warm Peach & Golden Glow',
    mood: 'Optimistic, energetic, positive',
    description: 'Alias for Sunset Bloom.',
    swatches: ['#F97316', '#FB923C', '#FFFBF5', '#EA580C', '#7C2D12'],
    get light() { return JOURNAL_THEMES['sunset-bloom'].light; },
    get dark() { return JOURNAL_THEMES['sunset-bloom'].dark; }
  },
  'emerald': {
    id: 'emerald',
    name: 'Botanical Serenity',
    emoji: '🌿',
    tagline: 'Natural & grounded',
    atmosphere: 'Sage Leaves & Mindful Earth',
    mood: 'Natural, grounded, mindful',
    description: 'Alias for Botanical Serenity.',
    swatches: ['#10B981', '#6EE7B7', '#F8FAF6', '#059669', '#064E3B'],
    get light() { return JOURNAL_THEMES['botanical-serenity'].light; },
    get dark() { return JOURNAL_THEMES['botanical-serenity'].dark; }
  },
  'rose': {
    id: 'rose',
    name: 'Rose Garden',
    emoji: '🌹',
    tagline: 'Romantic & warm',
    atmosphere: 'Romantic Ivory & Rose Petals',
    mood: 'Romantic, peaceful, warm',
    description: 'Alias for Rose Garden.',
    swatches: ['#F43F5E', '#FDA4AF', '#FFFDF8', '#E11D48', '#881337'],
    get light() { return JOURNAL_THEMES['rose-garden'].light; },
    get dark() { return JOURNAL_THEMES['rose-garden'].dark; }
  },
  'ocean': {
    id: 'ocean',
    name: 'Sakura Breeze',
    emoji: '🌸',
    tagline: 'Fresh & peaceful renewal',
    atmosphere: 'Cherry Blossoms & Breeze',
    mood: 'Fresh, peaceful, new beginnings',
    description: 'Alias for Sakura Breeze.',
    swatches: ['#EC4899', '#F472B6', '#FEFAFC', '#38BDF8', '#831843'],
    get light() { return JOURNAL_THEMES['sakura-breeze'].light; },
    get dark() { return JOURNAL_THEMES['sakura-breeze'].dark; }
  },
  'monochrome': {
    id: 'monochrome',
    name: 'Botanical Serenity',
    emoji: '🌿',
    tagline: 'Natural & mindful',
    atmosphere: 'Sage Leaves & Mindful Earth',
    mood: 'Natural, grounded, mindful',
    description: 'Alias for Botanical Serenity.',
    swatches: ['#10B981', '#6EE7B7', '#F8FAF6', '#059669', '#064E3B'],
    get light() { return JOURNAL_THEMES['botanical-serenity'].light; },
    get dark() { return JOURNAL_THEMES['botanical-serenity'].dark; }
  }
};

export const CORE_JOURNAL_THEME_IDS: JournalThemeId[] = [
  'rose-garden',
  'lavender-dream',
  'sunset-bloom',
  'sakura-breeze',
  'botanical-serenity'
];

function enrichThemeColors(colors: ThemeColors): ThemeColors {
  return {
    ...colors,
    buttonPrimaryBg: colors.buttonPrimaryBg || colors.primaryButtonBg,
    buttonPrimaryHover: colors.buttonPrimaryHover || colors.primaryButtonHover,
    buttonPrimaryText: colors.buttonPrimaryText || colors.primaryButtonText,
    buttonSecondaryBg: colors.buttonSecondaryBg || colors.secondaryButtonBg,
    buttonSecondaryBorder: colors.buttonSecondaryBorder || colors.secondaryButtonBorder,
    buttonSecondaryText: colors.buttonSecondaryText || colors.secondaryButtonText,
    dividerColor: colors.dividerColor || colors.writingPadBorder || 'border-black/10 dark:border-white/10',
  };
}

export function getJournalTheme(themeId?: string): JournalThemeDefinition {
  const theme = (themeId && JOURNAL_THEMES[themeId as JournalThemeId])
    ? JOURNAL_THEMES[themeId as JournalThemeId]
    : JOURNAL_THEMES['sakura-breeze'];

  return {
    ...theme,
    light: enrichThemeColors(theme.light),
    dark: enrichThemeColors(theme.dark),
  };
}
