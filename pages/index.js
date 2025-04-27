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
    <div style={{ padding: '2rem', backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: '2rem',
        fontSize: '2.5rem',
        color: '#333',
        fontWeight: 'bold'
      }}>
        🎯 GazaAid: Campagnes voor Gaza
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#555' }}>
        Een UMM initiatief om direct te helpen.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
      }}>
        {campaigns.map((c) => {
          const opgehaald = c.fields?.["Opgehaald bedrag"] || 0
          const doel = c.fields?.["Doelbedrag"] || 1
          const procent = Math.round((opgehaald / doel) * 100)

          let badgeColor = '#bbb'
          if (procent >= 90) badgeColor = '#22c55e' // groen
          else if (procent >= 50) badgeColor = '#3b82f6' // blauw

          return (
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
                  <strong>Opgehaald:</strong> €{opgehaald} / €{doel}
                </p>

                {/* Badge en Percentage */}
                <div style={{
                  display: 'inline-block',
                  backgroundColor: badgeColor,
                  color: 'white',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {procent}% behaald
                </div>

                {/* Progress bar */}
                <div style={{
                  marginTop: '1rem',
                  height: '10px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${procent}%`,
                    height: '100%',
                    backgroundColor: badgeColor,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
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
          )
        })}
      </div>
    </div>
  )
}
