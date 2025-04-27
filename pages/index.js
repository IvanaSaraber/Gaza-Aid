import { useEffect, useState } from 'react'

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('') // Filter state

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('https://gaza-aid-1byz.vercel.app/api/campaigns')
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }
        const data = await res.json()
        setCampaigns(data.records || [])
      } catch (err) {
        console.error('Fout bij ophalen campagnes:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCampaigns()
  }, [])

  const filteredCampaigns = campaigns.filter(c => {
    if (filter === 'almost-complete') {
      return (parseFloat(c.fields?.["Opgehaald bedrag"]) / parseFloat(c.fields?.["Doelbedrag"])) >= 0.9
    }
    if (filter === 'new') {
      const createdAt = new Date(c.createdTime)
      const now = new Date()
      const diffInDays = (now - createdAt) / (1000 * 3600 * 24)
      return diffInDays <= 7
    }
    if (filter === 'no-donation') {
      return c.fields?.["Dagen zonder donatie"] > 7
    }
    return true
  })

  if (loading) return <p>⏳ Laden...</p>
  if (error) return <p>❌ Fout: {error}</p>

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
          Help onschuldige burgers in Gaza
        </h1>

        <div style={{ display: 'inline-flex', marginBottom: '2rem' }}>
          {/* Filter options */}
          <button 
            onClick={() => setFilter('almost-complete')} 
            style={filter === 'almost-complete' ? activeFilterStyle : filterStyle}>
            Bijna Compleet
          </button>
          <button 
            onClick={() => setFilter('new')} 
            style={filter === 'new' ? activeFilterStyle : filterStyle}>
            Nieuw
          </button>
          <button 
            onClick={() => setFilter('no-donation')} 
            style={filter === 'no-donation' ? activeFilterStyle : filterStyle}>
            Lang Niet Gedoneerd
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem'
      }}>
        {filteredCampaigns.map((c) => (
          <div key={c.id} style={cardStyle}>
            {c.fields?.Afbeelding ? (
              <img 
                src={Array.isArray(c.fields.Afbeelding) ? c.fields.Afbeelding[0]?.url : c.fields.Afbeelding} 
                alt={c.fields?.["Campagnenaam"] || 'Campagne afbeelding'} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '200px', backgroundColor: '#ddd' }} />
            )}

            <div style={{ padding: '1rem' }}>
              <h2 style={headingStyle}>
                {c.fields?.["Campagnenaam"] || 'Naamloos'}
              </h2>
              <p style={{ marginBottom: '1rem', color: '#555' }}>
                <strong>Opgehaald:</strong> €{c.fields?.["Opgehaald bedrag"] || 0}
              </p>
              <p style={{ marginBottom: '1rem', color: '#555' }}>
                <strong>Doelbedrag:</strong> €{c.fields?.["Doelbedrag"] || 0}
              </p>
              
              {/* Progress bar */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Behaald: {((parseFloat(c.fields?.["Opgehaald bedrag"]) / parseFloat(c.fields?.["Doelbedrag"])) * 100).toFixed(2)}%
                </div>
                <div style={{ height: '10px', width: '100%', backgroundColor: '#ddd' }}>
                  <div style={{
                    height: '100%',
                    width: `${(parseFloat(c.fields?.["Opgehaald bedrag"]) / parseFloat(c.fields?.["Doelbedrag"])) * 100}%`,
                    backgroundColor: '#0070f3',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem' }}>
              <a 
                href={c.fields?.["Campagnelink"] || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Bekijk campagne
              </a>
            </div>
          </div>
        ))}
      </div>

      <footer style={footerStyle}>
        <p>Gesteund door United Muslim Mothers (UMM)</p>
      </footer>
    </div>
  )
}

// Styling for filter buttons
const filterStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#e0e0e0',
  border: '1px solid #ccc',
  borderRadius: '12px',
  margin: '0 0.5rem',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease'
}

const activeFilterStyle = {
  ...filterStyle,
  backgroundColor: '#0070f3',
  color: '#fff',
  borderColor: '#0070f3',
}

// Styling for the cards
const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
}

const headingStyle = {
  fontSize: '1.4rem',
  marginBottom: '1rem',
  color: '#333',
  fontWeight: 'bold',
}

const linkStyle = {
  display: 'block',
  backgroundColor: '#0070f3',
  color: 'white',
  textAlign: 'center',
  padding: '0.75rem',
  borderRadius: '8px',
  fontWeight: 'bold',
  textDecoration: 'none',
  transition: 'background-color 0.2s ease',
}

const footerStyle = {
  textAlign: 'center',
  marginTop: '3rem',
  padding: '1rem',
  backgroundColor: '#f5f5f5',
  fontSize: '1rem',
  color: '#666',
}
