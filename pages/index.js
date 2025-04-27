import { useEffect, useState } from 'react'

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [filteredCampaigns, setFilteredCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('https://gaza-aid-1byz.vercel.app/api/campaigns')
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }
        const data = await res.json()
        setCampaigns(data.records || [])
        setFilteredCampaigns(data.records || [])
      } catch (err) {
        console.error('Fout bij ophalen campagnes:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCampaigns()
  }, [])

  useEffect(() => {
    if (filter === 'all') {
      setFilteredCampaigns(campaigns)
    } else if (filter === 'noRecentDonations') {
      setFilteredCampaigns(campaigns.filter(c => (c.fields?.["Dagen sinds laatste donatie"] || 0) >= 7))
    } else if (filter === 'almostComplete') {
      setFilteredCampaigns(campaigns.filter(c => {
        const opgehaald = c.fields?.["Opgehaald bedrag"] || 0
        const doel = c.fields?.["Doelbedrag"] || 1
        const percentage = (opgehaald / doel) * 100
        return percentage >= 90 && percentage < 100
      }))
    } else if (filter === 'newCampaigns') {
      setFilteredCampaigns(campaigns.filter(c => (c.fields?.["Dagen sinds start"] || 0) <= 7))
    }
  }, [filter, campaigns])

  if (loading) return <p>⏳ Laden...</p>
  if (error) return <p>❌ Fout: {error}</p>

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
        🎯 GazaAid Campagnes
      </h1>

      {/* Filters */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        >
          <option value="all">Alle campagnes</option>
          <option value="noRecentDonations">Geen donaties in 7+ dagen</option>
          <option value="almostComplete">Laatste 10% nodig</option>
          <option value="newCampaigns">Nieuw gestart (binnen 7 dagen)</option>
        </select>
      </div>

      {/* Campagnes */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '2rem',
      }}>
        {filteredCampaigns.map((c) => (
          <div key={c.id} style={{
            border: '1px solid #e0e0e0',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {/* Afbeelding */}
            {c.fields?.Afbeelding ? (
              <img 
                src={Array.isArray(c.fields.Afbeelding) ? c.fields.Afbeelding[0]?.url : c.fields.Afbeelding} 
                alt={c.fields?.["Campagnenaam"] || 'Campagne afbeelding'} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '200px', backgroundColor: '#eee' }} />
            )}

            {/* Inhoud */}
            <div style={{ padding: '1rem', flexGrow: 1 }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#333' }}>
                {c.fields?.["Campagnenaam"] || 'Naamloos'}
              </h2>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                <strong>Opgehaald:</strong> €{c.fields?.["Opgehaald bedrag"] || 0}
              </p>
            </div>

            {/* Knop */}
            <div style={{ padding: '1rem' }}>
              <a 
                href={c.fields?.["Campagnelink"] || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  textAlign: 'center',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#005bb5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0070f3'}
              >
                Bekijk campagne
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#666', textAlign: 'center', padding: '1rem' }}>
        <p>
          GazaAid verwijst door naar externe crowdfundingpagina's en is niet verantwoordelijk voor het ingezamelde geld of het gebruik ervan.
          Wij ondersteunen alleen burgerinitiatieven en nemen afstand van enige vorm van terrorisme. 
          We gaan ervan uit dat de platforms waarnaar we linken zelf strikte compliance-richtlijnen volgen.
        </p>
      </div>
    </div>
  )
}
