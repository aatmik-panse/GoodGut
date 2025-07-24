export interface User {
  id: string;
  email?: string;
  isAnonymous: boolean;
  createdAt: Date;
}

export interface ChewSession {
  id: string;
  userId: string;
  chewCount: number;
  targetChews: number;
  mode: "tap" | "timer" | "ai";
  completedAt?: Date;
  createdAt: Date;
}

export interface WalkLog {
  id: string;
  userId: string;
  completedAt: Date;
  streak: number;
}

export interface GutBoxItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  isAvailable: boolean;
}

export interface UserPreferences {
  userId: string;
  waterReminders: boolean;
  reminderTimes: string[];
  gutBoxItems: GutBoxItem[];
  walkStreak: number;
  lastWalkDate?: Date;
}

export interface DigestiveTip {
  id: string;
  title: string;
  description: string;
  category: "bloating" | "fried-food" | "exam-stress" | "general";
  emoji: string;
}

export type TabName = "chew" | "walk" | "tips" | "water" | "gutbox";
