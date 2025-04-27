import { useEffect, useState } from 'react'

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('all')

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

  // Filter de campagnes op basis van de geselecteerde filter
  const filteredCampaigns = selectedFilter === 'all' ? campaigns : campaigns.filter(c => {
    const opgehaald = c.fields?.["Opgehaald bedrag"] || 0
    const doel = c.fields?.["Doelbedrag"] || 1
    const procent = Math.round((opgehaald / doel) * 100)
    return (selectedFilter === 'completed' && procent === 100) ||
      (selectedFilter === 'in-progress' && procent < 100)
  })

  return (
    <div style={{ padding: '3rem 1rem', backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: '2rem',
        fontSize: '2.5rem',
        color: '#333',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      }}>
        GazaAid: Campagnes voor Gaza
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#555' }}>
        Een UMM initiatief om direct te helpen.
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setSelectedFilter('all')} style={{
          padding: '0.5rem 1rem',
          backgroundColor: selectedFilter === 'all' ? '#22c55e' : '#fff',
          color: selectedFilter === 'all' ? '#fff' : '#333',
          border: '2px solid #22c55e',
          borderRadius: '50px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}>
          Alle
        </button>
        <button onClick={() => setSelectedFilter('in-progress')} style={{
          padding: '0.5rem 1rem',
          backgroundColor: selectedFilter === 'in-progress' ? '#3b82f6' : '#fff',
          color: selectedFilter === 'in-progress' ? '#fff' : '#333',
          border: '2px solid #3b82f6',
          borderRadius: '50px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}>
          In Progress
        </button>
        <button onClick={() => setSelectedFilter('completed')} style={{
          padding: '0.5rem 1rem',
          backgroundColor: selectedFilter === 'completed' ? '#22c55e' : '#fff',
          color: selectedFilter === 'completed' ? '#fff' : '#333',
          border: '2px solid #22c55e',
          borderRadius: '50px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}>
          Voltooid
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        justifyItems: 'center',
      }}>
        {filteredCampaigns.map((c) => {
          const opgehaald = c.fields?.["Opgehaald bedrag"] || 0
          const doel = c.fields?.["Doelbedrag"] || 1
          const procent = Math.round((opgehaald / doel) * 100)

          // Kleur voor progress bar
          let progressColor = '#f59e0b' // oranje
          if (procent >= 90) progressColor = '#22c55e' // groen
          else if (procent >= 50) progressColor = '#3b82f6' // blauw

          return (
            <div key={c.id} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Afbeelding */}
              {c.fields?.Afbeelding ? (
                <img
                  src={Array.isArray(c.fields.Afbeelding) ? c.fields.Afbeelding[0]?.url : c.fields.Afbeelding}
                  alt={c.fields?.["Campagnenaam"] || 'Campagne afbeelding'}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
                />
              ) : (
                <div style={{ width: '100%', height: '200px', backgroundColor: '#eee' }} />
              )}

              <div style={{ padding: '1.25rem', flexGrow: 1 }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#333' }}>
                  {c.fields?.["Campagnenaam"] || 'Naamloos'}
                </h2>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  <strong>Opgehaald:</strong> €{opgehaald} / €{doel}
                </p>

                {/* Progress bar */}
                <div style={{
                  height: '10px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${procent}%`,
                    height: '100%',
                    backgroundColor: progressColor,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#777',
                  textAlign: 'center'
                }}>
                  {procent}% Behaald
                </div>
              </div>

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
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#005bb5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0070f3'}
                >
                  Bekijk campagne
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
