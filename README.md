# Winter Games Map Application

A React Native Expo application that displays an interactive map of winter games venues with custom styling and venue information modals.

## Features

- **Full-screen Map**: Centered on Milan, Italy with custom winter theme styling
- **Custom Map Style**: White and light blue colors with hidden roads, focused on terrain
- **Interactive Markers**: Three custom markers for winter games venues:
  - **San Siro Stadium** (45.4934, 9.1155) - Opening Ceremony & Ice Hockey
  - **Cortina** (46.5391, 12.1383) - Alpine Skiing
  - **Val di Fiemme** (46.4186, 11.6486) - Ski Jumping & Cross-Country Skiing
- **Venue Details Modal**: Click any marker to view venue information in a bottom sheet modal
- **Responsive UI**: Styled with a winter theme featuring light colors

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Google Maps API Key (for real map functionality)

## Installation

1. Navigate to the project directory:
   ```bash
   cd "winter games"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Google Maps API Key:
   - Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Replace `YOUR_GOOGLE_MAPS_API_KEY` in `app.json` with your actual key

## Running the Application

### Start Expo Development Server:
```bash
npm start
```

### Run on specific platforms:
```bash
npm run ios      # iOS
npm run android  # Android
npm run web      # Web (browser)
```

## Project Structure

```
winter games/
├── App.js              # Main component with map and modal logic
├── index.js            # Entry point
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## Key Components

### App.js
- **MapView**: Full-screen map with custom styling
- **Markers**: Three venues with onPress handlers
- **Modal**: Bottom sheet displaying selected venue details
- **State Management**: `selectedVenue` tracks the currently selected venue

### Styling
- Winter theme with white and light blue colors
- Custom map style hiding roads and focusing on terrain
- Rounded modal with shadow effects
- Responsive layout using React Native StyleSheet

## Map Styling Details

The custom map style includes:
- White background for water features changed to light blue (#c9e8ff)
- Subtle terrain coloring
- Hidden POI labels for cleaner appearance
- Maintained road visibility with light styling
- Overall cool, winter aesthetic

## Venue Data Structure

Each venue contains:
- `id`: Unique identifier
- `name`: Venue name
- `sport`: Sport/event type
- `status`: Current status
- `latitude`: Geographic latitude
- `longitude`: Geographic longitude
- `description`: Detailed description

## Customization

### Add More Venues
Edit the `venues` array in `App.js` to add new locations with their coordinates and details.

### Modify Map Style
Adjust the `mapStyle` array in `App.js` to change colors and visibility of map elements.

### Change Initial Region
Update the `initialRegion` prop in `MapView` to center on different coordinates or adjust zoom level.

## Known Issues & Notes

- Remember to add your Google Maps API key to `app.json` for the maps to load properly
- The modal uses `animationType="slide"` for bottom-to-top animation
- Markers use the default pin style; customize by adding custom marker images

## Dependencies

- `react`: ^18.2.0
- `react-native`: 0.74.0
- `react-native-maps`: 1.10.0
- `expo`: ~51.0.0

## License

MIT License
