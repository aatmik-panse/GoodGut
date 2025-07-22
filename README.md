# GoodGut - Digestive Health App for Hostel Students

GoodGut is a mobile application designed to help hostel students improve their digestion through small daily habits. Built with React Native and Firebase, it offers a suite of tools to promote better gut health in a fun, engaging way.

## Features

### 1. Chew Count Tracker 🦷
- **Tap Mode**: Manually tap for each chew to reach the target of 30 chews
- **Timer Mode**: 30-second countdown timer for mindful chewing
- Visual progress tracking with animations and success messages

### 2. Post-Meal Walk Tracker 🚶‍♀️
- Log your post-meal walks with a simple button
- Track your walking streak
- Receive playful feedback and motivation

### 3. Daily Digestive Tips / What To Eat Today 🍽️
- Contextual food recommendations based on common hostel conditions
- Categories include bloating, fried food, exam stress, and general tips
- Practical advice that works in a hostel environment

### 4. Water Reminder System 💧
- Track daily water intake
- Customizable reminders with fun, Gen-Z style messages
- Visual progress tracking toward daily hydration goals

### 5. Gut Box Checklist 📦
- Inventory management for digestive health essentials
- Track items like jeera, saunf, ajwain, banana, curd, and sabja seeds
- Usage guides for each item

## Technical Details

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Authentication, Firestore)
- **Notifications**: Expo Notifications
- **Storage**: AsyncStorage for offline support

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/goodgut.git
cd goodgut
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm start
```

4. Follow the instructions to open the app in an emulator or on your physical device using the Expo Go app

## Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication and Firestore
3. Update the Firebase configuration in `firebase.config.ts` with your project credentials

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Designed for hostel students with limited resources and space
- Focused on practical, simple habits that make a big difference
- UI designed to be light, engaging, and student-friendly
