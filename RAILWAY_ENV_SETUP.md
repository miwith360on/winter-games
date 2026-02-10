# Railway Environment Variables Setup

Add these environment variables in your Railway dashboard:

1. Go to your Railway project
2. Click on your service
3. Go to "Variables" tab
4. Add these variables:

```
VITE_SPORTRADAR_API_KEY=your_sportradar_key
VITE_SPORTRADAR_ACCESS_LEVEL=trial
VITE_GNEWS_API_KEY=your_gnews_key
VITE_OPENWEATHER_API_KEY=your_openweather_key
```

**Important**: Railway will automatically inject these during build time for Vite to access them.

## Local Development

Copy `.env.example` to `.env` and add your API key:
```bash
cp web-app/.env.example web-app/.env
```

Then edit `web-app/.env` with your API key.
