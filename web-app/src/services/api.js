// Winter Games API Service for Web App
// SportsRadar API Integration

// API Configuration
const SPORTRADAR_API_KEY = import.meta.env.VITE_SPORTRADAR_API_KEY || '';
const ACCESS_LEVEL = import.meta.env.VITE_SPORTRADAR_ACCESS_LEVEL || 'trial';
const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY || '';
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

// Use backend proxy endpoints instead of calling SportsRadar directly (avoids CORS)
const API_BASE = '/api/sportradar';

// Free Alternative APIs for Olympic Data
const THESPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const OLYMPICS_RSS = 'https://olympics.com/en/rss/news';

// SportsRadar API Endpoints (kept for reference)
const SPORTRADAR_BASE = {
  winterSports: `https://api.sportradar.com/wintersports/trial/v1/en`,
  olympics: `https://api.sportradar.com/olympics/trial/v1/en`,
  iceHockey: `https://api.sportradar.com/icehockey/trial/v3/en`,
};

const GNEWS_BASE_URL = 'https://gnews.io/api/v4/search';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Winter Olympics 2026 Season ID (you'll need to get this from /seasons endpoint)
const WINTER_2026_SEASON_ID = 'sr:season:105357'; // placeholder - will fetch dynamically

// Helper function to convert country codes to flag emojis
const getCountryFlag = (countryCode) => {
  const flagMap = {
    'NOR': '🇳🇴', 'GER': '🇩🇪', 'USA': '🇺🇸', 'CAN': '🇨🇦', 
    'AUT': '🇦🇹', 'SUI': '🇨🇭', 'ROC': '🏳️', 'JPN': '🇯🇵',
    'CHN': '🇨🇳', 'FRA': '🇫🇷', 'ITA': '🇮🇹', 'SWE': '🇸🇪',
    'NED': '🇳🇱', 'KOR': '🇰🇷', 'FIN': '🇫🇮', 'GBR': '🇬🇧',
  };
  return flagMap[countryCode] || '🏴';
};

// Helper function to prioritize events (live > upcoming > finished)
const getEventPriority = (status) => {
  const statusLower = (status || '').toLowerCase();
  if (statusLower.includes('live') || statusLower.includes('in progress')) return 1;
  if (statusLower.includes('scheduled') || statusLower.includes('upcoming') || statusLower.includes('starts')) return 2;
  if (statusLower.includes('finished') || statusLower.includes('closed') || statusLower.includes('complete')) return 3;
  return 4; // Unknown status
};

// Generic fetch function with error handling for SportsRadar API (via backend proxy)
const fetchSportsRadar = async (url, useMockOnFail = true) => {
  try {
    // Extract the path from the full URL to send to our backend proxy
    let path = url;
    if (url.startsWith('http')) {
      // Extract path after the domain
      const urlObj = new URL(url);
      path = urlObj.pathname + urlObj.search;
    }
    
    // Call our backend proxy instead of SportsRadar directly
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data, source: 'sportradar' };
  } catch (error) {
    console.error('SportsRadar API Error:', error);
    if (useMockOnFail) {
      console.log('Falling back to mock data');
      return { success: false, error: error.message, useMock: true };
    }
    return { success: false, error: error.message };
  }
};

const fetchGNews = async (query, max = 10) => {
  if (!GNEWS_API_KEY) {
    return { success: false, error: 'Missing GNews API key', data: [] };
  }

  try {
    const params = new URLSearchParams({
      q: query,
      lang: 'en',
      max: String(max),
      token: GNEWS_API_KEY,
      sortby: 'publishedAt',
    });
    const response = await fetch(`${GNEWS_BASE_URL}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data, source: 'gnews' };
  } catch (error) {
    console.error('GNews API Error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

const fetchOpenWeather = async (lat, lon) => {
  if (!OPENWEATHER_API_KEY || lat == null || lon == null) {
    return { success: false, error: 'Missing OpenWeather API key', data: null };
  }

  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      units: 'metric',
      appid: OPENWEATHER_API_KEY,
    });
    const response = await fetch(`${OPENWEATHER_BASE_URL}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data, source: 'openweather' };
  } catch (error) {
    console.error('OpenWeather API Error:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Fetch from TheSportsDB (Free API for Olympic Events)
const fetchTheSportsDB = async (endpoint) => {
  try {
    const response = await fetch(`${THESPORTSDB_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, data, source: 'thesportsdb' };
  } catch (error) {
    console.error('TheSportsDB API Error:', error);
    return { success: false, error: error.message };
  }
};

// Fetch Olympic News as Live Updates
const fetchOlympicNews = async () => {
  if (!GNEWS_API_KEY) {
    return { success: false, data: [] };
  }
  
  try {
    const params = new URLSearchParams({
      q: 'Winter Olympics 2026 Milan',
      lang: 'en',
      max: '20',
      token: GNEWS_API_KEY,
      sortby: 'publishedAt',
    });
    const response = await fetch(`${GNEWS_BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data: data.articles || [], source: 'gnews' };
  } catch (error) {
    console.error('Olympic News API Error:', error);
    return { success: false, data: [] };
  }
};

const extractHeadlineSubject = (title) => {
  if (!title) return 'Winter Games';
  const cleaned = title.split(' - ')[0].split(' — ')[0].trim();
  const words = cleaned.split(/\n|\s+/).filter(Boolean);
  return words.slice(0, 4).join(' ');
};

const extractSportFromTitle = (title) => {
  const sports = ['Hockey', 'Skiing', 'Skating', 'Snowboard', 'Curling', 'Bobsled', 'Luge', 'Biathlon', 'Figure Skating'];
  const lowerTitle = (title || '').toLowerCase();
  for (const sport of sports) {
    if (lowerTitle.includes(sport.toLowerCase())) return sport;
  }
  return 'Winter Sport';
};

const detectSeverity = (text) => {
  const lower = (text || '').toLowerCase();
  if (lower.includes('fracture') || lower.includes('surgery') || lower.includes('torn')) return 'severe';
  if (lower.includes('questionable') || lower.includes('doubtful')) return 'moderate';
  return 'minor';
};

const detectDnfType = (text) => {
  const lower = (text || '').toLowerCase();
  if (lower.includes('dq') || lower.includes('disqual')) return 'DQ';
  return 'DNF';
};

// Venue/Event Data - Fetch from Winter Sports Schedule
export const getVenues = async () => {
  console.log('🔄 Fetching venues from multiple sources...');
  
  // Try 1: SportsRadar (trial)
  try {
    const seasonsUrl = `/wintersports/trial/v1/en/seasons.json`;
    const seasonsResult = await fetchSportsRadar(seasonsUrl);
    
    if (seasonsResult.success && !seasonsResult.useMock) {
      const latestSeason = seasonsResult.data.seasons?.[0];
      if (latestSeason && latestSeason.stage_id) {
        const scheduleUrl = `/wintersports/trial/v1/en/stage/${latestSeason.stage_id}/schedule.json`;
        const scheduleResult = await fetchSportsRadar(scheduleUrl);
        
        if (scheduleResult.success && scheduleResult.data.sport_events) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          const relevantEvents = scheduleResult.data.sport_events.filter(event => {
            if (!event.scheduled) return true;
            const eventDate = new Date(event.scheduled);
            return eventDate >= yesterday;
          });
          
          let allEvents = relevantEvents.map((event, idx) => ({
            id: idx + 1,
            name: event.sport_event_context?.venue?.name || 'Unknown Venue',
            sport: event.sport_event_context?.discipline?.name || 'Winter Sport',
            event: event.name || 'Event',
            status: event.sport_event_status?.status || 'Scheduled',
            latitude: event.sport_event_context?.venue?.latitude || 45.4642,
            longitude: event.sport_event_context?.venue?.longitude || 9.1900,
            score: event.sport_event_status?.home_score ? 
              `${event.sport_event_status.home_score} - ${event.sport_event_status.away_score}` : 'TBD',
            winner: event.sport_event_status?.winner_id ? 'TBD' : null,
            why: 'Live data from SportsRadar',
            term: `${event.sport_event_context?.discipline?.name || ''} event`,
            attendance: 0,
            temperature: '-5°C',
            scheduledTime: event.scheduled,
            priority: getEventPriority(event.sport_event_status?.status),
          }));
          
          allEvents.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            if (a.priority === 2) return new Date(a.scheduledTime) - new Date(b.scheduledTime);
            if (a.priority === 3) return new Date(b.scheduledTime) - new Date(a.scheduledTime);
            return 0;
          });
          
          const venues = allEvents.slice(0, 10);
          
          if (venues.length > 0) {
            console.log('✅ Got real data from SportsRadar:', venues.length, 'events');
            return { success: true, data: venues, source: 'sportradar' };
          }
        }
      }
    }
  } catch (error) {
    console.error('SportsRadar Error:', error);
  }

  // Try 2: TheSportsDB for Olympic Events
  console.log('🔄 Trying TheSportsDB...');
  try {
    const dbResult = await fetchTheSportsDB('/eventsseason.php?id=4424&s=2025-2026');
    if (dbResult.success && dbResult.data.events) {
      const olympicEvents = dbResult.data.events
        .filter(event => event.strSport && event.strLeague?.includes('Winter'))
        .slice(0, 10)
        .map((event, idx) => ({
          id: idx + 1,
          name: event.strVenue || 'Olympic Venue',
          sport: event.strSport || 'Winter Sport',
          event: event.strEvent || 'Olympic Event',
          status: event.strStatus || 'Scheduled',
          latitude: 45.4642,
          longitude: 9.1900,
          score: event.intHomeScore && event.intAwayScore ? 
            `${event.intHomeScore} - ${event.intAwayScore}` : 'TBD',
          winner: event.strWinner || null,
          why: 'Real event data from TheSportsDB',
          term: `${event.strSport} competition`,
          attendance: parseInt(event.intSpectators) || 0,
          temperature: '-5°C',
          scheduledTime: event.dateEvent,
          priority: getEventPriority(event.strStatus),
        }));
      
      if (olympicEvents.length > 0) {
        console.log('✅ Got real data from TheSportsDB:', olympicEvents.length, 'events');
        return { success: true, data: olympicEvents, source: 'thesportsdb' };
      }
    }
  } catch (error) {
    console.error('TheSportsDB Error:', error);
  }

  // Try 3: Use Olympic News as Event Updates
  console.log('🔄 Trying Olympic News...');
  try {
    const newsResult = await fetchOlympicNews();
    if (newsResult.success && newsResult.data.length > 0) {
      const newsEvents = newsResult.data.slice(0, 8).map((article, idx) => ({
        id: idx + 1,
        name: 'Milan Olympic Venue',
        sport: extractSportFromTitle(article.title),
        event: article.title.substring(0, 50),
        status: article.publishedAt ? 'Recent Update' : 'Live',
        latitude: 45.4642,
        longitude: 9.1900,
        score: 'See News',
        winner: null,
        why: article.description || 'Latest Olympic update',
        term: extractSportFromTitle(article.title) + ' news',
        attendance: 0,
        temperature: '-5°C',
        scheduledTime: article.publishedAt,
        priority: 2,
        newsUrl: article.url,
      }));
      
      console.log('✅ Got updates from Olympic News:', newsEvents.length, 'stories');
      return { success: true, data: newsEvents, source: 'news' };
    }
  } catch (error) {
    console.error('Olympic News Error:', error);
  }

  // Fallback: Enhanced Mock Data with realistic current events
  console.log('⚠️ Using enhanced mock data with simulated live updates');
  return {
    success: true,
    source: 'mock',
    data: [
      {
        id: 1,
        name: 'San Siro Stadium',
        sport: 'Hockey',
        event: "Women's Hockey: USA vs SUI",
        status: 'Live 3rd Period',
        latitude: 45.4934,
        longitude: 9.1155,
        score: 'USA 4 - 1 SUI',
        winner: null,
        why: 'USA is dominating possession. Switzerland is taking too many penalties (4 minor penalties), giving USA easy power play goals.',
        term: 'Power Play: When one team has more players on ice because the other team has a penalty.',
        attendance: 18234,
        temperature: '2°C',
      },
      {
        id: 2,
        name: 'Cortina',
        sport: 'Skiing',
        event: "Women's Freeski Slopestyle",
        status: 'Finished',
        latitude: 46.5391,
        longitude: 12.1383,
        score: '95.50',
        winner: 'Eileen Gu (CHN)',
        why: 'She landed a 1620 mute grab—a trick no other woman attempted today. Her amplitude (height) was 3ft higher than the silver medalist.',
        term: 'Amplitude: How high a skier goes in the air.',
        attendance: 8500,
        temperature: '-5°C',
      },
      {
        id: 3,
        name: 'Val di Fiemme',
        sport: 'Ski Jumping',
        event: "Men's Ski Jumping",
        status: 'Starts at 19:00',
        latitude: 46.4186,
        longitude: 11.6486,
        score: 'TBD',
        winner: 'TBD',
        why: 'Watch for Ryoyu Kobayashi. He uses a lower aggressive posture to cut wind resistance.',
        term: 'Telemark Landing: Landing with one foot ahead of the other to score style points.',
        attendance: 0,
        temperature: '-8°C',
      },
    ],
  };
};

// Medal Standings - Fetch from Olympic Medals API
export const getMedalStandings = async () => {
  try {
    // First get Olympic seasons to find Winter 2026 (using backend proxy)
    const seasonsUrl = `/olympics/trial/v1/en/seasons.json`;
    const seasonsResult = await fetchSportsRadar(seasonsUrl);
    
    if (seasonsResult.success && !seasonsResult.useMock) {
      // Find Winter 2026 season (or use latest winter olympics season)
      const winterSeasons = seasonsResult.data.seasons?.filter(s => 
        s.name?.toLowerCase().includes('winter') || s.id === WINTER_2026_SEASON_ID
      );
      
      const targetSeason = winterSeasons?.[0];
      if (targetSeason && targetSeason.id) {
        // Fetch medal table for this season (using backend proxy)
        const medalUrl = `/olympics/trial/v1/en/season/${targetSeason.id}/table.json`;
        const medalResult = await fetchSportsRadar(medalUrl);
        
        if (medalResult.success && medalResult.data.standings) {
          // Map SportsRadar medal data to our format
          const medals = medalResult.data.standings.map((standing, idx) => {
            const country = standing.competitor;
            return {
              rank: idx + 1,
              country: country.name,
              countryCode: country.abbreviation || 'XXX',
              flag: getCountryFlag(country.abbreviation),
              gold: standing.gold_medals || 0,
              silver: standing.silver_medals || 0,
              bronze: standing.bronze_medals || 0,
              total: (standing.gold_medals || 0) + (standing.silver_medals || 0) + (standing.bronze_medals || 0),
              trending: 'stable',
              whyWinning: `Real-time data from Winter Olympics 2026`,
              recentMedals: [],
            };
          });
          
          if (medals.length > 0) {
            return { success: true, data: medals, source: 'sportradar' };
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching medals from SportsRadar:', error);
  }

  // Fallback to mock data
  return {
      success: true,
      data: [
        {
          rank: 1,
          country: 'Norway',
          countryCode: 'NOR',
          flag: '🇳🇴',
          gold: 16,
          silver: 12,
          bronze: 8,
          total: 36,
          trending: 'up',
          recentMedals: [
            { event: "Men's Cross-Country 50km", medal: 'gold', athlete: 'Johannes Høsflot Klæbo' },
            { event: "Women's Biathlon 12.5km", medal: 'silver', athlete: 'Marte Olsbu Røiseland' },
          ],
          whyWinning: 'Norway excels in cross-country skiing and biathlon due to extensive training infrastructure, cultural emphasis on winter sports, and innovative wax technology for skis.',
        },
        {
          rank: 2,
          country: 'Germany',
          countryCode: 'GER',
          flag: '🇩🇪',
          gold: 14,
          silver: 10,
          bronze: 7,
          total: 31,
          trending: 'up',
          recentMedals: [
            { event: "Men's Luge Singles", medal: 'gold', athlete: 'Felix Loch' },
            { event: "Women's Alpine Combined", medal: 'bronze', athlete: 'Kira Weidle' },
          ],
          whyWinning: 'Germany dominates in luge, bobsled, and alpine skiing with world-class training facilities and aerodynamic research programs.',
        },
        {
          rank: 3,
          country: 'USA',
          countryCode: 'USA',
          flag: '🇺🇸',
          gold: 12,
          silver: 14,
          bronze: 11,
          total: 37,
          trending: 'stable',
          recentMedals: [
            { event: "Women's Halfpipe", medal: 'gold', athlete: 'Chloe Kim' },
            { event: "Men's Slopestyle", medal: 'silver', athlete: 'Red Gerard' },
            { event: "Ice Hockey", medal: 'silver', athlete: 'Team USA Women' },
          ],
          whyWinning: 'USA leads in snowboarding and freestyle events with strong X-Games culture and sponsorship ecosystem.',
        },
        {
          rank: 4,
          country: 'Canada',
          countryCode: 'CAN',
          flag: '🇨🇦',
          gold: 11,
          silver: 9,
          bronze: 13,
          total: 33,
          trending: 'up',
          whyWinning: 'Canada excels in ice hockey, curling, and freestyle skiing with "Own the Podium" funding program.',
        },
        {
          rank: 5,
          country: 'Austria',
          countryCode: 'AUT',
          flag: '🇦🇹',
          gold: 10,
          silver: 8,
          bronze: 6,
          total: 24,
          trending: 'stable',
          whyWinning: 'Austria dominates alpine skiing with alpine terrain advantage and ski racing tradition.',
        },
        {
          rank: 6,
          country: 'Switzerland',
          countryCode: 'SUI',
          flag: '🇨🇭',
          gold: 8,
          silver: 11,
          bronze: 9,
          total: 28,
          trending: 'down',
          whyWinning: 'Switzerland excels in alpine events and ski jumping with mountain geography and training culture.',
        },
        {
          rank: 7,
          country: 'ROC',
          countryCode: 'ROC',
          flag: '🏳️',
          gold: 7,
          silver: 10,
          bronze: 12,
          total: 29,
          trending: 'stable',
          whyWinning: 'Strong in figure skating and ice hockey with state-sponsored training programs.',
        },
        {
          rank: 8,
          country: 'Japan',
          countryCode: 'JPN',
          flag: '🇯🇵',
          gold: 6,
          silver: 5,
          bronze: 8,
          total: 19,
          trending: 'up',
          whyWinning: 'Japan rising in ski jumping and speed skating with investment in winter sports infrastructure.',
        },
      ],
    };
};

// Injury Report & DNF/DQ Data
export const getInjuryReport = async () => {
  const query = 'Winter Olympics 2026 injury OR injured OR withdrew OR out';
  const result = await fetchGNews(query, 10);

  if (!result.success || !Array.isArray(result.data?.articles)) {
    return { success: true, data: [], source: 'gnews' };
  }

  const data = result.data.articles.map((article, idx) => {
    const title = article.title || 'Winter Games update';
    const description = article.description || '';
    const combinedText = `${title} ${description}`;
    return {
      id: idx + 1,
      athlete: extractHeadlineSubject(title),
      country: 'News',
      countryCode: 'NEWS',
      flag: '📰',
      sport: 'Winter Games',
      injury: title,
      status: 'Reported',
      severity: detectSeverity(combinedText),
      date: article.publishedAt ? article.publishedAt.slice(0, 10) : '2026-02-10',
      upcomingEvent: 'Winter Games 2026',
      eventDate: article.publishedAt ? article.publishedAt.slice(0, 10) : '2026-02-10',
      details: description || article.content || 'Source: GNews',
    };
  });

  return { success: true, data, source: 'gnews' };
};

// DNF (Did Not Finish) and DQ (Disqualified) Data
export const getDNFandDQ = async () => {
  const query = 'Winter Olympics 2026 DNF OR DQ OR disqualified OR did not finish OR withdrew';
  const result = await fetchGNews(query, 10);

  if (!result.success || !Array.isArray(result.data?.articles)) {
    return { success: true, data: [], source: 'gnews' };
  }

  const data = result.data.articles.map((article, idx) => {
    const title = article.title || 'Winter Games update';
    const description = article.description || '';
    const combinedText = `${title} ${description}`;
    return {
      id: idx + 1,
      type: detectDnfType(combinedText),
      athlete: extractHeadlineSubject(title),
      country: 'News',
      flag: '📰',
      sport: 'Winter Games',
      event: title,
      date: article.publishedAt ? article.publishedAt.slice(0, 10) : '2026-02-10',
      reason: description || article.content || 'Source: GNews',
      videoAvailable: false,
      timestamp: 'N/A',
    };
  });

  return { success: true, data, source: 'gnews' };
};

export const getVenueWeather = async (lat, lon) => {
  const result = await fetchOpenWeather(lat, lon);
  if (!result.success || !result.data) {
    return { success: false, data: null, source: 'openweather' };
  }

  const tempC = Math.round(result.data.main?.temp ?? 0);
  const summary = result.data.weather?.[0]?.description || 'Unknown';
  const windKph = Math.round((result.data.wind?.speed ?? 0) * 3.6);

  return {
    success: true,
    source: 'openweather',
    data: {
      tempC,
      summary,
      windKph,
    },
  };
};

// Performance Analytics
export const getPerformanceAnalytics = async (eventId) => {
  // Return mock data directly
  return {
      success: true,
      data: {
        eventName: "Women's Hockey: USA vs SUI",
        winner: 'USA',
        finalScore: '4-1',
        analysis: {
          possessionTime: {
            USA: '64%',
            SUI: '36%',
          },
          shotsOnGoal: {
            USA: 38,
            SUI: 19,
          },
          penalties: {
            USA: 2,
            SUI: 6,
          },
          powerPlayGoals: {
            USA: 2,
            SUI: 0,
          },
          whyWon: 'USA dominated with superior puck control and forced Switzerland into defensive errors. Swiss took 6 penalties, giving USA multiple power-play opportunities which they converted efficiently (2/6 PP%). USA goalie saved 94.7% of shots.',
          keyMoments: [
            { time: '1st 08:15', event: 'USA Goal - Power Play by Hilary Knight' },
            { time: '2nd 04:22', event: 'SUI Penalty - Cross-checking (2 min)' },
            { time: '2nd 12:10', event: 'USA Goal - Kendall Coyne breakaway' },
            { time: '3rd 15:30', event: 'USA Goal - Empty net by Amanda Kessel' },
          ],
          topPerformers: [
            { name: 'Hilary Knight (USA)', stat: '2 goals, 1 assist', reason: 'Offensive dominance' },
            { name: 'Alex Rigsby (USA)', stat: '18 saves (94.7%)', reason: 'Shutdown goaltending' },
            { name: 'Lara Stalder (SUI)', stat: '1 goal', reason: 'Only Swiss scorer' },
          ],
        },
      },
    };
};

// Live Events Stream
export const getLiveEvents = async () => {
  // Try to fetch real Olympic news as "live" updates
  console.log('🔄 Fetching live Olympic updates from news...');
  try {
    const newsResult = await fetchOlympicNews();
    if (newsResult.success && newsResult.data.length > 0) {
      const liveUpdates = newsResult.data.slice(0, 5).map((article, idx) => ({
        id: idx + 1,
        sport: extractSportFromTitle(article.title),
        event: article.title.substring(0, 60),
        status: 'Breaking News',
        score: 'Latest Update',
        time: new Date(article.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        venue: 'Milan 2026',
        description: article.description,
        url: article.url,
      }));
      
      console.log('✅ Got live updates from news:', liveUpdates.length);
      return { success: true, data: liveUpdates, source: 'news' };
    }
  } catch (error) {
    console.error('Live Events Error:', error);
  }

  // Fallback to mock data
  return {
      success: true,
      source: 'mock',
      data: [
        {
          id: 1,
          sport: 'Ice Hockey',
          event: "Men's Semifinal: CAN vs SWE",
          status: 'Live - 2nd Period',
          score: 'CAN 2 - 1 SWE',
          time: '12:34',
          venue: 'San Siro Stadium',
        },
        {
          id: 2,
          sport: 'Figure Skating',
          event: "Women's Free Skate",
          status: 'Live - In Progress',
          score: 'Competitor 8 of 24',
          time: 'Now',
          venue: 'PalaItalia',
        },
        {
          id: 3,
          sport: 'Speed Skating',
          event: "Men's 1000m",
          status: 'Starting in 15 min',
          score: 'N/A',
          time: '19:15',
          venue: 'Oval Lingotto',
        },
      ],
    };
};

// Combined Dashboard Data
export const getDashboardData = async () => {
  const [venues, medals, injuries, dnf, liveEvents] = await Promise.all([
    getVenues(),
    getMedalStandings(),
    getInjuryReport(),
    getDNFandDQ(),
    getLiveEvents(),
  ]);

  return {
    success: true,
    data: {
      venues: venues.data || [],
      medals: medals.data || [],
      injuries: injuries.data || [],
      dnf: dnf.data || [],
      liveEvents: liveEvents.data || [],
    },
  };
};

export default {
  getVenues,
  getMedalStandings,
  getInjuryReport,
  getDNFandDQ,
  getPerformanceAnalytics,
  getLiveEvents,
  getDashboardData,
};
