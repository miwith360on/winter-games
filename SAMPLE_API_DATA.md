# Sample JSON Data for API Endpoints

## 1. Medal Standings (medals.json)
Paste this at https://www.npoint.io/

```json
[
  {
    "rank": 1,
    "country": "Norway",
    "countryCode": "NOR",
    "flag": "🇳🇴",
    "gold": 16,
    "silver": 12,
    "bronze": 8,
    "total": 36,
    "trending": "up",
    "whyWinning": "Norway excels in cross-country skiing and biathlon due to extensive training infrastructure, cultural emphasis on winter sports, and innovative wax technology for skis."
  },
  {
    "rank": 2,
    "country": "Germany",
    "countryCode": "GER",
    "flag": "🇩🇪",
    "gold": 14,
    "silver": 10,
    "bronze": 7,
    "total": 31,
    "trending": "up",
    "whyWinning": "Germany dominates in luge, bobsled, and alpine skiing with world-class training facilities and aerodynamic research programs."
  },
  {
    "rank": 3,
    "country": "USA",
    "countryCode": "USA",
    "flag": "🇺🇸",
    "gold": 12,
    "silver": 14,
    "bronze": 11,
    "total": 37,
    "trending": "stable",
    "whyWinning": "USA leads in snowboarding and freestyle events with strong X-Games culture and sponsorship ecosystem."
  }
]
```

## 2. Injury Report (injuries.json)

```json
[
  {
    "id": 1,
    "athlete": "Mikaela Shiffrin",
    "country": "USA",
    "countryCode": "USA",
    "flag": "🇺🇸",
    "sport": "Alpine Skiing",
    "injury": "Knee Soreness",
    "status": "Questionable",
    "severity": "moderate",
    "date": "2026-02-08",
    "upcomingEvent": "Giant Slalom",
    "eventDate": "2026-02-10",
    "details": "Experienced discomfort during training. Team doctors evaluating. May skip event as precaution."
  },
  {
    "id": 2,
    "athlete": "Connor McDavid",
    "country": "Canada",
    "countryCode": "CAN",
    "flag": "🇨🇦",
    "sport": "Ice Hockey",
    "injury": "Rest (Load Management)",
    "status": "Probable",
    "severity": "minor",
    "date": "2026-02-09",
    "upcomingEvent": "Semifinal vs Sweden",
    "eventDate": "2026-02-11",
    "details": "Scheduled rest day. Expected to play in semifinals. No structural damage."
  }
]
```

## 3. DNF & DQ Report (dnf.json)

```json
[
  {
    "id": 1,
    "type": "DNF",
    "athlete": "Lindsey Vonn",
    "country": "USA",
    "flag": "🇺🇸",
    "sport": "Alpine Skiing",
    "event": "Women's Downhill",
    "date": "2026-02-08",
    "reason": "Crashed on final turn at 95 km/h. Skis caught edge on icy patch. Walked away uninjured.",
    "videoAvailable": true,
    "timestamp": "1:34.2"
  },
  {
    "id": 2,
    "type": "DQ",
    "athlete": "Natalie Geisenberger",
    "country": "Germany",
    "flag": "🇩🇪",
    "sport": "Luge",
    "event": "Women's Singles",
    "date": "2026-02-06",
    "reason": "Sled runners measured 0.3mm outside regulation width. Disqualified after 3rd run.",
    "videoAvailable": false,
    "timestamp": "Post-Run 3"
  }
]
```

## 4. Venues (venues.json)

```json
[
  {
    "id": 1,
    "name": "San Siro Stadium",
    "sport": "Hockey",
    "event": "Women's Hockey: USA vs SUI",
    "status": "Live 3rd Period",
    "latitude": 45.4934,
    "longitude": 9.1155,
    "score": "USA 4 - 1 SUI",
    "winner": null,
    "why": "USA is dominating possession. Switzerland is taking too many penalties (4 minor penalties), giving USA easy power play goals.",
    "term": "Power Play: When one team has more players on ice because the other team has a penalty.",
    "attendance": 18234,
    "temperature": "2°C"
  },
  {
    "id": 2,
    "name": "Cortina",
    "sport": "Skiing",
    "event": "Women's Freeski Slopestyle",
    "status": "Finished",
    "latitude": 46.5391,
    "longitude": 12.1383,
    "score": "95.50",
    "winner": "Eileen Gu (CHN)",
    "why": "She landed a 1620 mute grab—a trick no other woman attempted today. Her amplitude (height) was 3ft higher than the silver medalist.",
    "term": "Amplitude: How high a skier goes in the air.",
    "attendance": 8500,
    "temperature": "-5°C"
  }
]
```

## 5. Live Events (live.json)

```json
[
  {
    "id": 1,
    "sport": "Ice Hockey",
    "event": "Men's Semifinal: CAN vs SWE",
    "status": "Live - 2nd Period",
    "score": "CAN 2 - 1 SWE",
    "time": "12:34",
    "venue": "San Siro Stadium"
  },
  {
    "id": 2,
    "sport": "Figure Skating",
    "event": "Women's Free Skate",
    "status": "Live - In Progress",
    "score": "Competitor 8 of 24",
    "time": "Now",
    "venue": "PalaItalia"
  }
]
```

---

## 📝 How to Use with npoint.io

### Step-by-Step:

1. **Go to** https://www.npoint.io/
2. **Click** "New JSON Document" (no signup needed!)
3. **Paste** one of the JSON samples above
4. **Click** "Save" or press Ctrl+S
5. **Copy** the URL (looks like: `https://api.npoint.io/abc123def456`)
6. **Repeat** for each data type (medals, injuries, dnf, venues, live)

### Update Your API Service:

Open `services/api.js` and replace:

```javascript
const ENDPOINTS = {
  venues: 'https://api.npoint.io/YOUR_VENUES_ID',
  medals: 'https://api.npoint.io/YOUR_MEDALS_ID',
  injuries: 'https://api.npoint.io/YOUR_INJURIES_ID',
  dnf: 'https://api.npoint.io/YOUR_DNF_ID',
  performance: 'https://api.npoint.io/YOUR_PERFORMANCE_ID',
  liveEvents: 'https://api.npoint.io/YOUR_LIVE_ID',
};
```

### Update Data Later:

1. Keep your npoint.io URLs bookmarked
2. Visit them to edit your JSON anytime
3. Changes appear instantly in your app!

---

## 🎯 Pro Tip: Update Your Data Dynamically

You can manually update the JSON on npoint.io as the games progress:
- Change medal counts when athletes win
- Add new injuries as they happen
- Update DNF/DQ reports
- Change event statuses from "Upcoming" → "Live" → "Finished"

Your app will fetch the latest data every 30 seconds automatically! 🚀
