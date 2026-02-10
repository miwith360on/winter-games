import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// SportsRadar API Proxy Middleware (to avoid CORS issues)
const SPORTRADAR_API_KEY = process.env.VITE_SPORTRADAR_API_KEY || '';

app.use('/api/sportradar', async (req, res) => {
  try {
    if (!SPORTRADAR_API_KEY) {
      return res.status(500).json({ error: 'SportsRadar API key not configured' });
    }

    // Build the full SportsRadar URL
    const path = req.path;
    const baseUrl = 'https://api.sportradar.com';
    const fullUrl = `${baseUrl}${path}?api_key=${SPORTRADAR_API_KEY}`;

    console.log(`🔄 Proxying SportsRadar API: ${path}`);

    // Forward the request to SportsRadar
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ SportsRadar API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ 
        error: `SportsRadar API error: ${response.status}`,
        details: errorText 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: 'Internal proxy error', message: error.message });
  }
});

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Winter Games App running on port ${PORT}`);
});
