# GP SwimLab

GP SwimLab is an Expo React Native MVP for swimmers, parents, coaches and club managers. It focuses on race preparation, performance tracking, controlled achievement sharing, club communication, meet team management and PDF-ready reporting flows.

## Features

- Role-based dashboard for Athlete, Parent, Coach and Club Manager accounts
- Race tracking with PB checks, split fields and compact race history
- Coach Meet Manager with meet entries, heat/lane planning and live race-day result entry
- Club Board for announcements and seen/read status
- Calendar with weekly and monthly event views
- Performance analysis, AI Coach mock responses, nutrition, reminders and PDF report mock flows
- Controlled Performance Wall / Başarı Duvarı with moderation-ready structure
- Phone and email OTP mock verification
- Turkish and English locale structure
- Firebase-ready service layer and mock data for MVP demos

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- AsyncStorage
- Firebase-ready scaffolding
- lucide-react-native icons
- expo-linear-gradient

## Requirements

- Node.js compatible with the installed Expo SDK
- npm
- Expo Go for Android/iOS testing

## Installation

```bash
npm install
```

Create a local environment file from the template:

```bash
cp .env.example .env
```

Fill only local/demo values. Do not commit real Firebase, OpenAI or production keys.

## Run

```bash
npm start
```

Platform shortcuts:

```bash
npm run android
npm run ios
npm run web
```

Open the QR code with Expo Go.

## Checks

TypeScript:

```bash
npm run typecheck
```

Expo dependency compatibility:

```bash
npx expo install --check
```

## Role System

The app uses a central mock session role:

- `athlete` - Athlete dashboard, race tracking, AI Coach, nutrition, reports and Performance Wall
- `parent` - Parent view for athlete tracking, club board, calendar, PDF reports and notifications
- `coach` - Athlete list, Coach Meet Manager, Club Board, Calendar, Team PDF and AI Coach
- `club_admin` - Club Board, Calendar, Meet Team List, athlete/team management and club reports

The session is mock/local for MVP testing and is prepared for future Firebase Auth and Firestore integration.

## Demo OTP Codes

- Phone OTP: `123456`
- Email OTP: `654321`

## Environment Variables

See `.env.example` for placeholders:

- Firebase config placeholders
- OpenAI API key placeholder
- App environment values

Never commit real credentials, service account files or mobile signing keys.

## Notes

- This is an MVP with mock data and mock PDF/AI/OTP flows.
- `npm audit fix --force` should not be used because it may break Expo SDK compatibility.
- Sensitive files such as `.env`, `google-services.json`, `GoogleService-Info.plist`, keystores and build outputs are ignored by git.
