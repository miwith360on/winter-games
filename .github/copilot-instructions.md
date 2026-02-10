# Winter Games Map Application - Project Instructions

This is a React Native Expo project for a winter games venue map application with interactive markers and venue information modals.

## Project Overview
- **Framework**: React Native with Expo
- **Primary Library**: react-native-maps
- **Styling Theme**: Winter (white and light blue colors)
- **Main Features**: Full-screen map, custom markers, venue details modal

## Project Setup Completed
- ✅ Expo project structure initialized
- ✅ Core dependencies configured (react-native-maps, expo)
- ✅ Google Maps API key configuration added to app.json
- ✅ Main App component with full implementation

## Key Features Implemented
1. Full-screen map centered on Milan, Italy (45.4642, 9.1900)
2. Custom winter theme map styling (white and light blue)
3. Three venue markers:
   - San Siro Stadium (Opening/Hockey)
   - Cortina (Skiing)
   - Val di Fiemme (Ski Jumping)
4. Interactive marker press handling with selectedVenue state
5. Bottom modal displaying venue details (name, sport, status, description)
6. Close button to dismiss modal

## File Structure
```
winter games/
├── App.js              (Main component with map and modal logic)
├── index.js            (Entry point)
├── app.json            (Expo configuration)
├── package.json        (Dependencies)
├── README.md           (User documentation)
├── .gitignore          (Git configuration)
└── .github/
    └── copilot-instructions.md (This file)
```

## How to Run
1. Install dependencies: `npm install`
2. Add Google Maps API key to app.json
3. Start development server: `npm start`
4. Run on desired platform: `npm run ios`, `npm run android`, or `npm run web`

## Customization Options
- **Add More Venues**: Edit the venues array in App.js
- **Change Map Style**: Modify the mapStyle array in App.js
- **Adjust Initial Region**: Update MapView's initialRegion prop
- **Customize Modal**: Modify styles in App.js StyleSheet

## Notes
- Ensure Google Maps API key is configured before running
- Water features are styled with light blue (#c9e8ff) for winter theme
- Modal uses slide animation from bottom of screen
- Markers are interactive and trigger venue detail display
