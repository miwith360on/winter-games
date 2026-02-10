import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import QRCode from 'qrcode.react'
import './App.css'
import { getMedalStandings, getInjuryReport, getDNFandDQ, getVenues as fetchVenues } from './services/api'

// Custom marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const getStatusColor = (status) => {
  if (status.includes('Live')) return '#00d4ff'
  if (status.includes('Finished')) return '#00ff88'
  return '#ffa500'
}

export default function App() {
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [currentTab, setCurrentTab] = useState('home')
  const [liveUpdates, setLiveUpdates] = useState(true)
  const [favoriteTeam, setFavoriteTeam] = useState('USA')
  const [venues, setVenues] = useState([])
  const [medalData, setMedalData] = useState([])
  const [injuries, setInjuries] = useState([])
  const [dnfData, setDnfData] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData()
    
    // Auto-refresh every 30 seconds if live updates enabled
    if (liveUpdates) {
      const interval = setInterval(fetchAllData, 30000)
      return () => clearInterval(interval)
    }
  }, [liveUpdates])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [venuesRes, medalsRes, injuriesRes, dnfRes] = await Promise.all([
        fetchVenues(),
        getMedalStandings(),
        getInjuryReport(),
        getDNFandDQ(),
      ])

      if (venuesRes.success) setVenues(venuesRes.data)
      if (medalsRes.success) setMedalData(medalsRes.data)
      if (injuriesRes.success) setInjuries(injuriesRes.data)
      if (dnfRes.success) setDnfData(dnfRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Combine injury data and DNF alerts
  const alerts = [
    ...injuries.map(injury => ({
      id: `injury-${injury.id}`,
      icon: injury.severity === 'severe' ? '🚨' : '⚠️',
      text: `${injury.athlete} (${injury.flag} ${injury.country}): ${injury.injury} - ${injury.status}`,
      type: 'injury',
      details: injury.details,
    })),
    ...dnfData.map(dnf => ({
      id: `dnf-${dnf.id}`,
      icon: dnf.type === 'DQ' ? '❌' : '⚠️',
      text: `${dnf.athlete} (${dnf.flag} ${dnf.country}) - ${dnf.type} in ${dnf.event}`,
      type: dnf.type.toLowerCase(),
      details: dnf.reason,
    })),
  ]

  const getRiskLevel = (venue) => {
    if (venue.status.includes('Live')) return { level: 'LIVE', percent: 75, color: '#00d4ff' }
    if (venue.status.includes('Finished')) return { level: 'COMPLETED', percent: 100, color: '#00ff88' }
    return { level: 'UPCOMING', percent: 0, color: '#ffa500' }
  }

  const renderHome = () => (
    <div className="home-view">
      <header className="app-header">
        <h1>❄️ Winter Games</h1>
        <p>Live Event Tracker</p>
      </header>

      {venues.map((venue) => {
        const risk = getRiskLevel(venue)
        return (
          <div 
            key={venue.id} 
            className="event-card"
            onClick={() => setSelectedVenue(venue)}
          >
            <div className="event-card-header">
              <div>
                <h3>{venue.name}</h3>
                <p className="sport-tag">{venue.sport}</p>
              </div>
              <div className="status-badge" style={{ borderColor: risk.color }}>
                <span style={{ color: risk.color }}>●</span> {risk.level}
              </div>
            </div>

            <div className="risk-meter">
              <div className="risk-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="circle-bg" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    className="circle-progress"
                    style={{
                      stroke: risk.color,
                      strokeDasharray: `${2 * Math.PI * 45 * (risk.percent / 100)} ${2 * Math.PI * 45}`
                    }}
                  />
                </svg>
                <div className="risk-text">
                  <span className="percent">{risk.percent}%</span>
                  <span className="label">{risk.level.toLowerCase()}</span>
                </div>
              </div>
            </div>

            <div className="event-metrics">
              <div className="metric">
                <span className="label">EVENT</span>
                <span className="value">{venue.event}</span>
              </div>
              <div className="metric">
                <span className="label">SCORE</span>
                <span className="value">{venue.score}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderMap = () => (
    <MapContainer center={[45.4642, 9.1900]} zoom={8} className="map-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {venues.map((venue) => (
        <Marker
          key={venue.id}
          position={[venue.latitude, venue.longitude]}
          onClick={() => {
            setSelectedVenue(venue)
            setCurrentTab('home')
          }}
        >
          <Popup>
            <div className="popup">
              <h3>{venue.name}</h3>
              <p>{venue.sport}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )

  const renderStats = () => (
    <div className="home-view">
      <header className="app-header">
        <h1>📊 Medal Standings</h1>
        <p>Winter Games 2026</p>
        <button onClick={fetchAllData} className="refresh-btn-small">🔄 Refresh</button>
      </header>

      <div className="stats-card">
        <table className="medal-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Country</th>
              <th>🥇</th>
              <th>🥈</th>
              <th>🥉</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {medalData.map((row) => (
              <tr key={row.rank}>
                <td className="rank">{row.rank}</td>
                <td className="country">{row.flag} {row.country}</td>
                <td className="gold">{row.gold}</td>
                <td className="silver">{row.silver}</td>
                <td className="bronze">{row.bronze}</td>
                <td className="total">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Why Countries Are Winning Section */}
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '12px', color: '#333' }}>🔍 Why Are They Winning?</h2>
        {medalData.slice(0, 5).map((country) => country.whyWinning && (
          <div key={country.rank} className="country-analysis">
            <h3>{country.flag} {country.country}</h3>
            <p className="analysis-text">{country.whyWinning}</p>
            {country.trending && (
              <span className={`trend-badge ${country.trending}`}>
                {country.trending === 'up' ? '📈 Trending Up' : country.trending === 'down' ? '📉 Slowing Down' : '➡️ Stable'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderAlerts = () => (
    <div className="home-view">
      <header className="app-header">
        <h1>⚠️ Alerts & Updates</h1>
        <p>Injuries, DNF & DQ Reports</p>
        <button onClick={fetchAllData} className="refresh-btn-small">🔄 Refresh</button>
      </header>

      {alerts.length === 0 ? (
        <div className="no-alerts">No alerts at this time ✅</div>
      ) : (
        <>
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-card">
              <span className="alert-icon">{alert.icon}</span>
              <div className="alert-content">
                <p className="alert-text">{alert.text}</p>
                {alert.details && <p className="alert-details">{alert.details}</p>}
                <span className="alert-type">{alert.type}</span>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Separate DNF/DQ Section */}
      <h2 style={{ marginTop: '30px', fontSize: '18px', color: '#333' }}>❌ DNF & DQ Reports</h2>
      {dnfData.map((item) => (
        <div key={item.id} className="dnf-card">
          <div className="dnf-header">
            <span className={`dnf-badge ${item.type.toLowerCase()}`}>{item.type}</span>
            <span className="dnf-date">{item.date}</span>
          </div>
          <h3>{item.flag} {item.athlete} - {item.country}</h3>
          <p className="dnf-event">{item.event} ({item.sport})</p>
          <p className="dnf-reason">{item.reason}</p>
          {item.videoAvailable && (
            <span className="video-badge">📹 Video Available</span>
          )}
        </div>
      ))}
    </div>
  )

  const renderSettings = () => (
    <div className="home-view">
      <header className="app-header">
        <h1>⚙️ Settings</h1>
        <p>Customize your experience</p>
      </header>

      <div className="settings-card">
        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-label">Live Updates</span>
            <span className="setting-desc">Get real-time notifications</span>
          </div>
          <button 
            className={`toggle-switch ${liveUpdates ? 'active' : ''}`}
            onClick={() => setLiveUpdates(!liveUpdates)}
          >
            <div className="toggle-slider"></div>
          </button>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-label">Favorite Team</span>
            <span className="setting-desc">Your preferred team</span>
          </div>
          <select 
            className="team-dropdown"
            value={favoriteTeam}
            onChange={(e) => setFavoriteTeam(e.target.value)}
          >
            <option value="USA">🇺🇸 USA</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="Japan">🇯🇵 Japan</option>
            <option value="Norway">🇳🇴 Norway</option>
            <option value="Germany">🇩🇪 Germany</option>
          </select>
        </div>

        <button className="reset-btn">Reset App</button>
      </div>
    </div>
  )

  return (
    <div className="app">
      {currentTab === 'home' && renderHome()}
      {currentTab === 'map' && renderMap()}
      {currentTab === 'stats' && renderStats()}
      {currentTab === 'alerts' && renderAlerts()}
      {currentTab === 'settings' && renderSettings()}

      <nav className="bottom-nav">
        <button className={`nav-btn ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>
          <span className="icon">🏠</span>
          <span>Home</span>
        </button>
        <button className={`nav-btn ${currentTab === 'map' ? 'active' : ''}`} onClick={() => setCurrentTab('map')}>
          <span className="icon">🗺️</span>
          <span>Map</span>
        </button>
        <button className={`nav-btn ${currentTab === 'stats' ? 'active' : ''}`} onClick={() => setCurrentTab('stats')}>
          <span className="icon">📊</span>
          <span>Stats</span>
        </button>
        <button className={`nav-btn ${currentTab === 'alerts' ? 'active' : ''}`} onClick={() => setCurrentTab('alerts')}>
          <span className="icon">⚠️</span>
          <span>Alerts</span>
        </button>
        <button className={`nav-btn ${currentTab === 'settings' ? 'active' : ''}`} onClick={() => setCurrentTab('settings')}>
          <span className="icon">⚙️</span>
          <span>Settings</span>
        </button>
      </nav>

      {selectedVenue && currentTab === 'home' && (
        <div className="modal-overlay" onClick={() => setSelectedVenue(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedVenue(null)}>✕</button>
            
            <h2 className="event-title">{selectedVenue.event}</h2>

            {selectedVenue.status === 'Finished' && selectedVenue.winner !== 'TBD' && (
              <div className="winner-section">
                <span className="medal">🥇</span>
                <p className="winner">{selectedVenue.winner}</p>
              </div>
            )}

            <div className="info-section">
              <div className="info-row">
                <label>Score:</label>
                <span>{selectedVenue.score}</span>
              </div>
              <div className="info-row">
                <label>Status:</label>
                <span>{selectedVenue.status}</span>
              </div>
            </div>

            <div className="analyst-box">
              <h4>The Analyst Says:</h4>
              <p>{selectedVenue.why}</p>
            </div>

            <div className="term-pill">{selectedVenue.term}</div>

            <div className="qr-section">
              <p className="qr-label">Venue Details QR Code</p>
              <div className="qr-container">
                <QRCode
                  value={`${selectedVenue.name}|${selectedVenue.sport}|${selectedVenue.status}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

