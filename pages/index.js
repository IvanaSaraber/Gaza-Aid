import { useEffect, useState } from 'react'

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [committedSearchTerm, setCommittedSearchTerm] = useState('')


  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('https://gaza-aid-1byz.vercel.app/api/campaigns')
        if (!res.ok) throw new Error(`API error: ${res.status}`)
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

  useEffect(() => {
    const handleScroll = () => {
      const btn = document.getElementById('topBtn')
      if (btn) {
        btn.style.display = window.scrollY > 300 ? 'block' : 'none'
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleFilterChange = (filter) => setSelectedFilter(filter)
  const handleResetFilters = () => setSelectedFilter('')

  const filteredCampaigns = campaigns.filter((campaign) => {
    const name = campaign.fields?.["Campagnenaam"]?.toLowerCase() || ""
    const matchSearch = name.includes(searchTerm.toLowerCase())
    if (!matchSearch) return false

    if (selectedFilter === 'bijna_compleet') {
      const opgehaald = campaign.fields['Opgehaald bedrag']
      const doel = campaign.fields['Doelbedrag']
      const percentage = (opgehaald / doel) * 100
      return percentage >= 85 && percentage < 100
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

  if (loading) return <p style={{ textAlign: 'center' }}>⏳ Laden...</p>
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>❌ Fout: {error}</p>

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(to right, #b2c2a2, #9bb491)',
        color: '#fff',
        padding: '3rem 1rem',
        textAlign: 'center',
        borderRadius: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Steun Gaza rechtstreeks
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Een overzicht van crowdfundingcampagnes voor Gaza – veilig, vertrouwd en direct.
        </p>
        <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
          Totaal opgehaald: €{totaalOpgehaald.toLocaleString()}
        </p>
      </div>

      {/* Zoekfunctie */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Zoek op campagnenaam..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setCommittedSearchTerm(searchTerm)
          }}
          style={{
            padding: '0.5rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '100%',
            maxWidth: '400px'
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            { key: 'bijna_compleet', label: 'Bijna compleet' },
            { key: 'nieuw', label: 'Nieuwe campagnes' },
            { key: 'lang_niet_doneren', label: 'Lang niet gedoneerd' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              style={{
                backgroundColor: selectedFilter === key ? '#b2c2a2' : '#ccc',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                border: 'none',
                transition: '0.3s ease'
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={handleResetFilters}
            style={{
              backgroundColor: '#ff6f61',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              border: 'none'
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
        gap: '2rem'
      }}>
        {filteredCampaigns.map((c) => {
          const opgehaald = c.fields?.["Opgehaald bedrag"] || 0
          const doel = c.fields?.["Doelbedrag"] || 1
          const percentage = Math.min(Math.round((opgehaald / doel) * 100), 100)
          const afbeelding = Array.isArray(c.fields?.Afbeelding) ? c.fields.Afbeelding[0]?.url : c.fields?.Afbeelding

          return (
            <div
              key={c.id}
              style={{
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
              {afbeelding ? (
                <img
                  src={afbeelding}
                  alt={c.fields?.["Campagnenaam"] || 'Campagne afbeelding'}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '200px', backgroundColor: '#eee' }} />
              )}
              <div style={{ padding: '1rem', flexGrow: 1 }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: '#333' }}>
                  {c.fields?.["Campagnenaam"] || 'Naamloos'}
                </h2>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  €{opgehaald.toLocaleString()} van €{doel.toLocaleString()}
                </p>
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
                    fontSize: '0.85rem',
                    color: '#333'
                  }}>
                    {percentage}%
                  </span>
                </div>
              </div>
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
                    textDecoration: 'none'
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

      <footer style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem', color: '#777' }}>
        <p>Een initiatief van United Muslim Mothers (UMM)</p>
      </footer>

      {/* Back to top button */}
      <button
        id="topBtn"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: '#ff6f61',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1rem',
          borderRadius: '50%',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        }}
      >
        ↑
      </button>
    </div>
  )
}
