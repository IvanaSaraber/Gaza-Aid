import { useEffect, useState } from 'react'

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  if (loading) return <p>⏳ Laden...</p>
  if (error) return <p>❌ Fout: {error}</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🎯 GazaAid Campagnes</h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {campaigns.map((c) => (
          <div key={c.id} style={{
            border: '1px solid #ddd',
            borderRadius: '10px',
            padding: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h2 style={{
              fontSize: '1.5rem', 
              marginBottom: '0.5rem', 
              color: '#333'
            }}>
              {c.fields?.["Campagnenaam"] || 'Naamloos'}
            </h2>
            <p style={{ fontSize: '1rem', color: '#555', marginBottom: '1rem' }}>
              <strong>Opgehaald:</strong> €{c.fields?.["Opgehaald bedrag"] || 0}
            </p>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#2d7cdb',
              marginBottom: '1rem'
            }}>
              €{c.fields?.["Opgehaald bedrag"] || 0}
            </div>
            <div style={{
              backgroundColor: '#2d7cdb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              textAlign: 'center',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f63b6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2d7cdb'}>
              Bekijk Details
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
