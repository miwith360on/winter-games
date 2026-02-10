# Winter Games API Integration Guide

## Overview
Your Winter Games app now has comprehensive API integration for live tracking of:
- **Medal Standings** - Real-time country rankings with explanations of why they're winning
- **Performance Analytics** - Detailed analysis of who won, who lost, and why
- **Injury Reports** - Live injury updates with severity and upcoming events
- **DNF & DQ Data** - Did Not Finish and Disqualified athlete tracking

## 🎯 Features

### 📊 Medal Standings
- Live medal count for all countries (Gold, Silver, Bronze, Total)
- **Why They're Winning** - Detailed explanations of each country's success
- Trending indicators (📈 Up, 📉 Down, ➡️ Stable)
- Recent medals won by each country

### 🏥 Injury Tracking
- Athlete injury status (Questionable, Probable, Out, Day-to-Day)
- Injury severity levels (Minor, Moderate, Severe)
- Upcoming event information
- Detailed injury descriptions

### ❌ DNF & DQ Reports
- Did Not Finish (DNF) tracking with reasons
- Disqualified (DQ) athlete reports
- Video availability indicators
- Timestamp and detailed explanations

### 🎯 Performance Analytics
- Who won and why they played better
- Detailed statistics (possession time, shots, penalties)
- Key moments timeline
- Top performer highlights

## 📁 File Structure

```
winter games/
├── services/
│   └── api.js                  # React Native API service
├── web-app/
│   └── src/
│       └── services/
│           └── api.js          # Web app API service
├── App.js                      # React Native app (updated with APIs)
└── web-app/src/App.jsx         # Web app (updated with APIs)
```

## 🔌 API Endpoints

The API service (`services/api.js`) provides these functions:

### 1. `getVenues()`
Fetches venue/event data including:
- Event name, sport, status
- Live scores
- Performance analysis
- Weather and attendance

### 2. `getMedalStandings()`
Returns medal table with:
- Country rankings
- Medal counts (gold, silver, bronze)
- **Why they're winning** explanations
- Trending data

### 3. `getInjuryReport()`
Provides injury updates:
- Athlete name, country, sport
- Injury type and severity
- Status (Questionable, Probable, Out)
- Upcoming events affected

### 4. `getDNFandDQ()`
Returns DNF/DQ data:
- Type (DNF or DQ)
- Athlete information
- Detailed reason for DNF/DQ
- Video availability

### 5. `getPerformanceAnalytics(eventId)`
Detailed event analysis:
- Why the winner won
- Key statistics
- Timeline of key moments
- Top performers

### 6. `getLiveEvents()`
Current live events stream

### 7. `getDashboardData()`
Combined fetch of all data in one call

## 🚀 How to Use

### React Native App

The app now has **3 floating action buttons**:

1. **🚑 Button** (bottom) - Opens Injury Report
2. **🏅 Button** (middle) - Opens Medal Standings
3. **❌ Button** (top) - Opens DNF & DQ Report
4. **🔄 Button** (top-right) - Manual refresh

**Auto-refresh:** Data automatically refreshes every 30 seconds

### Web App

Navigate using the bottom navigation bar:

- **🏠 Home** - Event cards
- **🗺️ Map** - Venue locations
- **📊 Stats** - Medal standings with analysis
- **⚠️ Alerts** - Injuries and DNF/DQ reports
- **⚙️ Settings** - Live updates toggle

Each tab has a **🔄 Refresh** button for manual updates.

## 🔧 Customizing API Endpoints

### Using Real APIs

Replace the placeholder endpoints in `services/api.js`:

```javascript
const ENDPOINTS = {
  venues: 'YOUR_REAL_API_URL',
  medals: 'YOUR_REAL_API_URL',
  injuries: 'YOUR_REAL_API_URL',
  dnf: 'YOUR_REAL_API_URL',
  performance: 'YOUR_REAL_API_URL',
  liveEvents: 'YOUR_REAL_API_URL',
};
```

### Recommended API Services

1. **Free JSON Hosting:**
   - [npoint.io](https://www.npoint.io/) - Currently used
   - [jsonbin.io](https://jsonbin.io/)
   - [myjson.online](https://myjson.online/)

2. **Backend Services:**
   - [Firebase Realtime Database](https://firebase.google.com/)
   - [Supabase](https://supabase.com/)
   - Custom Node.js/Express API

3. **Olympic Data APIs:**
   - Official Olympic API (requires approval)
   - Sports data providers (RapidAPI, SportsData.io)

## 📊 Sample API Response Format

### Medal Standings Response:
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "country": "Norway",
      "flag": "🇳🇴",
      "gold": 16,
      "silver": 12,
      "bronze": 8,
      "total": 36,
      "trending": "up",
      "whyWinning": "Norway excels in cross-country skiing..."
    }
  ]
}
```

### Injury Report Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "athlete": "Mikaela Shiffrin",
      "country": "USA",
      "flag": "🇺🇸",
      "sport": "Alpine Skiing",
      "injury": "Knee Soreness",
      "status": "Questionable",
      "severity": "moderate",
      "details": "Experienced discomfort during training...",
      "upcomingEvent": "Giant Slalom",
      "eventDate": "2026-02-10"
    }
  ]
}
```

### DNF/DQ Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "DNF",
      "athlete": "Lindsey Vonn",
      "country": "USA",
      "flag": "🇺🇸",
      "sport": "Alpine Skiing",
      "event": "Women's Downhill",
      "date": "2026-02-08",
      "reason": "Crashed on final turn at 95 km/h...",
      "videoAvailable": true,
      "timestamp": "1:34.2"
    }
  ]
}
```

## 🔄 Auto-Refresh Feature

### React Native:
```javascript
// Auto-refresh every 30 seconds
useEffect(() => {
  fetchAllData();
  const interval = setInterval(fetchAllData, 30000);
  return () => clearInterval(interval);
}, []);
```

### Web App:
```javascript
// Auto-refresh when live updates enabled
useEffect(() => {
  fetchAllData();
  if (liveUpdates) {
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }
}, [liveUpdates]);
```

## 🎨 UI Components

### React Native Modals:
- **Injury Modal** - ScrollView with injury cards
- **Medal Modal** - Scrollable medal standings with analysis
- **DNF Modal** - DNF/DQ report cards

### Web App Views:
- **Stats Tab** - Medal table + "Why They're Winning" section
- **Alerts Tab** - Combined injury + DNF reports with details

## 🛠️ Troubleshooting

### API Not Loading?
1. Check console for errors
2. Verify API endpoints are accessible
3. Check network connection
4. Try manual refresh button

### Data Not Updating?
1. Confirm auto-refresh is enabled (web app settings)
2. Check console for fetch errors
3. Verify API returns valid JSON

### Missing Data Fields?
The API service includes fallback mock data if the API fails or returns invalid data.

## 📱 Testing

### Test with Mock Data:
The current setup uses comprehensive mock data. Test by:
1. Opening the app
2. Clicking the floating action buttons (🚑 🏅 ❌)
3. Viewing detailed information

### Test with Real APIs:
1. Replace endpoints in `services/api.js`
2. Ensure your API returns the same JSON structure
3. Test refresh functionality

## 🚀 Next Steps

1. **Deploy Your Own API:**
   - Host JSON data on npoint.io or similar
   - Or build a backend with Node.js/Express
   - Or use Firebase/Supabase

2. **Add More Features:**
   - Push notifications for injuries
   - Favorite teams/athletes
   - Historical data and graphs
   - Social sharing

3. **Enhance Analytics:**
   - More detailed performance metrics
   - Predictive analytics
   - Head-to-head comparisons

## 📖 Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Documentation](https://react.dev/)
- [Fetch API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 🙋 Support

For questions or issues with the API integration, check:
1. Console logs for error messages
2. Network tab in browser DevTools
3. API endpoint responses

---

**Enjoy your Winter Games live tracking app! 🎿⛷️🏂🏒⛸️**
