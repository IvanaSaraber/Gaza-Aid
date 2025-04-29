import { useEffect, useState } from 'react'

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('')

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

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter)
  }

  const handleResetFilters = () => {
    setSelectedFilter('')
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (selectedFilter === 'bijna_compleet') {
      return campaign.fields['Opgehaald bedrag'] >= campaign.fields['Doelbedrag'] * 0.9
    }
    if (selectedFilter === 'nieuw') {
      return new Date(campaign.fields['Startdatum']) >= new Date(new Date().setDate(new Date().getDate() - 7))
    }
    if (selectedFilter === 'lang_niet_doneren') {
      return campaign.fields['Dagen sinds laatste donatie'] >= 30
    }
    return true
  })

  const totaalOpgehaald = campaigns.reduce((sum, c) => sum + (c.fields['Opgehaald bedrag'] || 0), 0)

  if (loading) return <p>⏳ Laden...</p>
  if (error) return <p>❌ Fout: {error}</p>

  return (
      {/* Introblok */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, #b2c2a2, #9bb491)',
        borderRadius: '16px',
        marginBottom: '2rem',
        color: '#ffffff',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          fontFamily: 'Arial, sans-serif'
        }}>
          Gaza Campaigns
        </h1>
        <p style={{
          fontSize: '1rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Doneer rechtstreeks aan geselecteerde campagnes voor Gaza. Samen maken we impact.
        </p>
        <p style={{ marginBottom: '0.5rem' }}>
          Totaal opgehaald: <strong>€{totaalOpgehaald.toLocaleString()}</strong>
        </p>
      </div>


      {/* Filters */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            onClick={() => handleFilterChange('bijna_compleet')}
            style={{
              backgroundColor: selectedFilter === 'bijna_compleet' ? '#b2c2a2' : '#ccc',
              color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', border: 'none',
              transition: 'background-color 0.3s ease'
            }}
          >
            Bijna compleet
          </button>
          <button
            onClick={() => handleFilterChange('nieuw')}
            style={{
              backgroundColor: selectedFilter === 'nieuw' ? '#b2c2a2' : '#ccc',
              color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', border: 'none',
              transition: 'background-color 0.3s ease'
            }}
          >
            Nieuwe campagnes
          </button>
          <button
            onClick={() => handleFilterChange('lang_niet_doneren')}
            style={{
              backgroundColor: selectedFilter === 'lang_niet_doneren' ? '#b2c2a2' : '#ccc',
              color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', border: 'none',
              transition: 'background-color 0.3s ease'
            }}
          >
            Lang niet gedoneerd
          </button>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={handleResetFilters}
            style={{
              backgroundColor: '#ff6f61',
              color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', border: 'none',
              transition: 'background-color 0.3s ease'
            }}
          >
            Reset filters
          </button>
        </div>
      </div>

      {/* Campagnes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
      }}>
        {filteredCampaigns.map((c) => {
          const opgehaald = c.fields?.["Opgehaald bedrag"] || 0
          const doel = c.fields?.["Doelbedrag"] || 1
          const percentage = Math.min(Math.round((opgehaald / doel) * 100), 100)

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
              cursor: 'pointer',
              marginBottom: '1rem'
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
                  {`€${opgehaald.toLocaleString()} van €${doel.toLocaleString()}`}
                </p>

                {/* Progress bar + percentage */}
                <div style={{ width: '100%', backgroundColor: '#eee', height: '8px', borderRadius: '4px', position: 'relative' }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: '#b2c2a2',
                      borderRadius: '4px'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '0',
                    fontSize: '0.9rem',
                    color: '#333'
                  }}>
                    {percentage}%
                  </span>
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
                    backgroundColor: '#b2c2a2',
                    color: 'white',
                    textAlign: 'center',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#99aa88'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#b2c2a2'}
                >
                  Bekijk campagne
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#777' }}>
        <p>Een initiatief van United Muslim Mothers (UMM)</p>
      </footer>
    </div>
  )
}
