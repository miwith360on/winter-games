// Winter Games API Service for Web App
// SportsRadar API Integration

// SportsRadar API Configuration
const SPORTRADAR_API_KEY = import.meta.env.VITE_SPORTRADAR_API_KEY || '4p5OoGQaBjBMe4ChDsY9DsetwbefZgonAR3dsQBX';
const ACCESS_LEVEL = import.meta.env.VITE_SPORTRADAR_ACCESS_LEVEL || 'trial';

// SportsRadar API Endpoints
const SPORTRADAR_BASE = {
  winterSports: `https://api.sportradar.com/wintersports/${ACCESS_LEVEL}/v1/en`,
  olympics: `https://api.sportradar.com/olympics/${ACCESS_LEVEL}/v1/en`,
  iceHockey: `https://api.sportradar.com/icehockey/${ACCESS_LEVEL}/v3/en`,
};

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

// Generic fetch function with error handling for SportsRadar API
const fetchSportsRadar = async (url, useMockOnFail = true) => {
  try {
    const fullUrl = `${url}${url.includes('?') ? '&' : '?'}api_key=${SPORTRADAR_API_KEY}`;
    const response = await fetch(fullUrl, {
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

// Venue/Event Data - Fetch from Winter Sports Schedule
export const getVenues = async () => {
  try {
    // Fetch winter sports seasons first
    const seasonsUrl = `${SPORTRADAR_BASE.winterSports}/seasons.json`;
    const seasonsResult = await fetchSportsRadar(seasonsUrl);
    
    if (seasonsResult.success && !seasonsResult.useMock) {
      // Get the latest season
      const latestSeason = seasonsResult.data.seasons?.[0];
      if (latestSeason && latestSeason.stage_id) {
        // Fetch schedule for the season
        const scheduleUrl = `${SPORTRADAR_BASE.winterSports}/stage/${latestSeason.stage_id}/schedule.json`;
        const scheduleResult = await fetchSportsRadar(scheduleUrl);
        
        if (scheduleResult.success && scheduleResult.data.sport_events) {
          // Map SportsRadar events to our venue format
          const venues = scheduleResult.data.sport_events.slice(0, 10).map((event, idx) => ({
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
          }));
          
          if (venues.length > 0) {
            return { success: true, data: venues, source: 'sportradar' };
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching venues from SportsRadar:', error);
  }

  // Fallback to mock data
  return {
    success: true,
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
  }
  
  return result;
};

// Medal Standings - Fetch from Olympic Medals API
export const getMedalStandings = async () => {
  try {
    // First get Olympic seasons to find Winter 2026
    const seasonsUrl = `${SPORTRADAR_BASE.olympics}/seasons.json`;
    const seasonsResult = await fetchSportsRadar(seasonsUrl);
    
    if (seasonsResult.success && !seasonsResult.useMock) {
      // Find Winter 2026 season (or use latest winter olympics season)
      const winterSeasons = seasonsResult.data.seasons?.filter(s => 
        s.name?.toLowerCase().includes('winter') || s.id === WINTER_2026_SEASON_ID
      );
      
      const targetSeason = winterSeasons?.[0];
      if (targetSeason && targetSeason.id) {
        // Fetch medal table for this season
        const medalUrl = `${SPORTRADAR_BASE.olympics}/season/${targetSeason.id}/table.json`;
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
  // Return mock data directly
  return {
      success: true,
      data: [
        {
          id: 1,
          athlete: 'Mikaela Shiffrin',
          country: 'USA',
          countryCode: 'USA',
          flag: '🇺🇸',
          sport: 'Alpine Skiing',
          injury: 'Knee Soreness',
          status: 'Questionable',
          severity: 'moderate',
          date: '2026-02-08',
          upcomingEvent: 'Giant Slalom',
          eventDate: '2026-02-10',
          details: 'Experienced discomfort during training. Team doctors evaluating. May skip event as precaution.',
        },
        {
          id: 2,
          athlete: 'Connor McDavid',
          country: 'Canada',
          countryCode: 'CAN',
          flag: '🇨🇦',
          sport: 'Ice Hockey',
          injury: 'Rest (Load Management)',
          status: 'Probable',
          severity: 'minor',
          date: '2026-02-09',
          upcomingEvent: 'Semifinal vs Sweden',
          eventDate: '2026-02-11',
          details: 'Scheduled rest day. Expected to play in semifinals. No structural damage.',
        },
        {
          id: 3,
          athlete: 'Akito Watabe',
          country: 'Japan',
          countryCode: 'JPN',
          flag: '🇯🇵',
          sport: 'Nordic Combined',
          injury: 'Ankle Sprain',
          status: 'Out',
          severity: 'severe',
          date: '2026-02-07',
          upcomingEvent: 'Individual Gundersen',
          eventDate: '2026-02-09',
          details: 'Fell during training jump. MRI confirmed Grade 2 sprain. Out for remainder of games.',
        },
        {
          id: 4,
          athlete: 'Kamila Valieva',
          country: 'ROC',
          countryCode: 'ROC',
          flag: '🏳️',
          sport: 'Figure Skating',
          injury: 'Back Strain',
          status: 'Day-to-Day',
          severity: 'minor',
          date: '2026-02-09',
          upcomingEvent: 'Free Skate',
          eventDate: '2026-02-12',
          details: 'Minor strain after triple axel. Receiving treatment. Will attempt to compete.',
        },
      ],
    };
};

// DNF (Did Not Finish) and DQ (Disqualified) Data
export const getDNFandDQ = async () => {
  // Return mock data directly
    return {
      success: true,
      data: [
        {
          id: 1,
          type: 'DNF',
          athlete: 'Lindsey Vonn',
          country: 'USA',
          flag: '🇺🇸',
          sport: 'Alpine Skiing',
          event: "Women's Downhill",
          date: '2026-02-08',
          reason: 'Crashed on final turn at 95 km/h. Skis caught edge on icy patch. Walked away uninjured.',
          videoAvailable: true,
          timestamp: '1:34.2',
        },
        {
          id: 2,
          type: 'DNF',
          athlete: 'Therese Johaug',
          country: 'Norway',
          flag: '🇳🇴',
          sport: 'Cross-Country',
          event: '30km Mass Start',
          date: '2026-02-07',
          reason: 'Ski pole broke at 18km mark. No backup available. Withdrew from race.',
          videoAvailable: false,
          timestamp: '18.2km',
        },
        {
          id: 3,
          type: 'DQ',
          athlete: 'Natalie Geisenberger',
          country: 'Germany',
          flag: '🇩🇪',
          sport: 'Luge',
          event: "Women's Singles",
          date: '2026-02-06',
          reason: 'Sled runners measured 0.3mm outside regulation width. Disqualified after 3rd run.',
          videoAvailable: false,
          timestamp: 'Post-Run 3',
        },
        {
          id: 4,
          type: 'DQ',
          athlete: 'Yuzuru Hanyu',
          country: 'Japan',
          flag: '🇯🇵',
          sport: 'Figure Skating',
          event: "Men's Free Skate",
          date: '2026-02-09',
          reason: 'Costume malfunction (loose sequin) during performance. Technical violation under ISU rules.',
          videoAvailable: true,
          timestamp: '2:45',
        },
        {
          id: 5,
          type: 'DNF',
          athlete: 'Shaun White',
          country: 'USA',
          flag: '🇺🇸',
          sport: 'Snowboarding',
          event: "Men's Halfpipe",
          date: '2026-02-08',
          reason: 'Fell on landing of double cork 1440. Board broke on impact. Could not complete run.',
          videoAvailable: true,
          timestamp: 'Run 1, 0:42',
        },
      ],
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
  // Return mock data directly
  return {
      success: true,
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
