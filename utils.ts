import AsyncStorage from '@react-native-async-storage/async-storage';
import { DigestiveTip } from './types';

export const digestiveTips: DigestiveTip[] = [
  {
    id: '1',
    title: 'Have curd today',
    description: 'Probiotics in curd help with digestion and reduce bloating after heavy meals',
    category: 'bloating',
    emoji: '🥛'
  },
  {
    id: '2',
    title: 'Eat banana + plain rice',
    description: 'Perfect combo for upset stomach and easy digestion',
    category: 'general',
    emoji: '🍌'
  },
  {
    id: '3',
    title: 'Sip jeera water',
    description: 'Cumin water reduces gas and improves digestion after fried food',
    category: 'fried-food',
    emoji: '💧'
  },
  {
    id: '4',
    title: 'Take deep breaths',
    description: 'Stress affects digestion. 5 deep breaths before meals helps',
    category: 'exam-stress',
    emoji: '🧘‍♀️'
  },
  {
    id: '5',
    title: 'Walk for 10 mins',
    description: 'Light movement after meals aids digestion and prevents acidity',
    category: 'general',
    emoji: '🚶‍♀️'
  },
  {
    id: '6',
    title: 'Chew fennel seeds',
    description: 'Saunf after meals freshens breath and reduces bloating',
    category: 'bloating',
    emoji: '🌿'
  }
];

export const gutBoxItems = [
  { id: '1', name: 'Jeera (Cumin)', emoji: '🌾', description: 'For gas and bloating' },
  { id: '2', name: 'Saunf (Fennel)', emoji: '🌿', description: 'Natural mouth freshener' },
  { id: '3', name: 'Ajwain (Carom)', emoji: '🌱', description: 'Instant acidity relief' },
  { id: '4', name: 'Banana', emoji: '🍌', description: 'Easy on stomach' },
  { id: '5', name: 'Curd', emoji: '🥛', description: 'Probiotics for gut health' },
  { id: '6', name: 'Sabja Seeds', emoji: '⚫', description: 'Cooling and fiber-rich' }
];

export const waterReminders = [
  "Water > Cold drinks, don't @ me 💧",
  "Hydrate your belly, not just your brain 🧠💧",
  "Your gut is thirsty, feed it some H2O 🌊",
  "Sip sip hooray! Time for water break 🎉",
  "Dehydration = Bad vibes. Drink up! ✨"
];

export const getRandomTip = (): DigestiveTip => {
  const randomIndex = Math.floor(Math.random() * digestiveTips.length);
  return digestiveTips[randomIndex];
};

export const getRandomWaterReminder = (): string => {
  const randomIndex = Math.floor(Math.random() * waterReminders.length);
  return waterReminders[randomIndex];
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const calculateStreak = (dates: Date[]): number => {
  if (dates.length === 0) return 0;
  
  const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());
  let streak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const previousDate = new Date(sortedDates[i - 1]);
    
    const diffTime = previousDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// Storage helpers
export const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error storing data:', e);
  }
};

export const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error getting data:', e);
    return null;
  }
};
