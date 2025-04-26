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
            backgroundColor: '#fff'
          }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              {c.fields?.["Campagnenaam"] || 'Naamloos'}
            </h2>
            <p><strong>Opgehaald:</strong> €{c.fields?.["Opgehaald bedrag"] || 0}</p>
            {/* Hier kunnen we later een knop of afbeelding toevoegen */}
          </div>
        ))}
      </div>
    </div>
  )
}
