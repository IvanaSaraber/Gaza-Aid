import { useEffect, useState } from 'react'

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [filteredCampaigns, setFilteredCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('Alle')
  const [searchTerm, setSearchTerm] = useState('')

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
    let filtered = [...campaigns]

    // Filter logica
    if (activeFilter === 'Nieuw') {
      filtered = filtered.filter(c => {
        const created = new Date(c.createdTime)
        const now = new Date()
        const diff = (now - created) / (1000 * 60 * 60 * 24) // dagen verschil
        return diff <= 7 // campagnes jonger dan 7 dagen
      })
    } else if (activeFilter === 'Bijna gehaald') {
      filtered = filtered.filter(c => {
        const opgehaald = c.fields?.["Opgehaald bedrag"] || 0
        const doel = c.fields?.["Doelbedrag"] || 1
        return opgehaald / doel >= 0.8
      })
    }

    // Zoekfilter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(c => 
        c.fields?.["Campagnenaam"]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCampaigns(filtered)
  }, [activeFilter, searchTerm, campaigns])

  if (loading) return <p>⏳ Laden...</p>
  if (error) return <p>❌ Fout: {error}</p>

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
      {/* Titel */}
      <h1 style={{
        textAlign: 'center', 
        marginBottom: '1rem', 
        fontSize: '2.5rem', 
        fontWeight: '700', 
        color: '#222'
      }}>
        GazaAid Campagnes
      </h1>
      <p style={{
        textAlign: 'center',
        marginBottom: '2rem',
        fontSize: '1.1rem',
        color: '#555'
      }}>
        Ontdek en steun campagnes voor Gaza
      </p>

      {/* Filters */}
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {['Alle', 'Nieuw', 'Bijna gehaald'].map(filter => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: activeFilter === filter ? '2px solid #0070f3' : '2px solid #ccc',
              backgroundColor: activeFilter === filter ? '#0070f3' : '#fff',
              color: activeFilter === filter ? '#fff' : '#333',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Zoekbalk */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Zoek campagne..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '0.75rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '9999px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Campagnes */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '2rem'
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
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#333' }}>
                {c.fields?.["Campagnenaam"] || 'Naamloos'}
              </h2>
              <p style={{ marginBottom: '0.5rem', color: '#666' }}>
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
    </div>
  )
}
