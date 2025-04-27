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
    <div style={{ padding: '2rem', backgroundColor: '#F9F1E7', minHeight: '100vh', fontFamily: 'Lora, serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#D35400', marginBottom: '1rem' }}>
          Help onschuldige burgers in Gaza
        </h1>

        <div style={{ display: 'inline-flex', marginBottom: '2rem' }}>
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2rem'
      }}>
        {filteredCampaigns.map((c) => (
          <div key={c.id} style={cardStyle}>
            {c.fields?.Afbeelding ? (
              <img 
                src={Array.isArray(c.fields.Afbeelding) ? c.fields.Afbeelding[0]?.url : c.fields.Afbeelding} 
                alt={c.fields?.["Campagnenaam"] || 'Campagne afbeelding'} 
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
              />
            ) : (
              <div style={{ width: '100%', height: '120px', backgroundColor: '#BDC3C7', borderRadius: '8px 8px 0 0' }} />
            )}

            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '240px' }}>
              <h2 style={headingStyle}>
                {c.fields?.["Campagnenaam"] || 'Naamloos'}
              </h2>
              <div style={{ color: '#8E7C4E', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <p><strong>Opgehaald:</strong> €{c.fields?.["Opgehaald bedrag"] || 0}</p>
                <p><strong>Doelbedrag:</strong> €{c.fields?.["Doelbedrag"] || 0}</p>
              </div>
              {/* Progress bar */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Behaald: {((parseFloat(c.fields?.["Opgehaald bedrag"]) / parseFloat(c.fields?.["Doelbedrag"])) * 100).toFixed(2)}%
                </div>
                <div style={{ height: '6px', width: '100%', backgroundColor: '#BDC3C7' }}>
                  <div style={{
                    height: '100%',
                    width: `${(parseFloat(c.fields?.["Opgehaald bedrag"]) / parseFloat(c.fields?.["Doelbedrag"])) * 100}%`,
                    backgroundColor: '#D35400',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

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
  backgroundColor: '#F4CDBD',
  border: '1px solid #F4A261',
  borderRadius: '12px',
  margin: '0 0.5rem',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease'
}

const activeFilterStyle = {
  ...filterStyle,
  backgroundColor: '#D35400',
  color: '#fff',
  borderColor: '#D35400',
}

// Styling for the cards
const cardStyle = {
  border: '1px solid #F4A261',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  overflow: 'hidden', // Ensures content is clipped within the card
  maxHeight: '340px', // Prevent cards from getting too tall
  padding: '0', // Remove extra padding to adjust layout
}

const headingStyle = {
  fontSize: '1rem',
  marginBottom: '0.5rem',
  color: '#D35400',
  fontWeight: '600',
  lineHeight: '1.3',
  textOverflow: 'ellipsis', 
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}

const linkStyle = {
  display: 'block',
  backgroundColor: '#D35400',
  color: 'white',
  textAlign: 'center',
  padding: '0.75rem',
  borderRadius: '8px',
  fontWeight: '600',
  textDecoration: 'none',
  transition: 'background-color 0.2s ease',
}

const footerStyle = {
  textAlign: 'center',
  marginTop: '3rem',
  padding: '1rem',
  backgroundColor: '#F9F1E7',
  fontSize: '1rem',
  color: '#8E7C4E',
}
