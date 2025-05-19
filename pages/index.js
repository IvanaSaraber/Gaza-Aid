import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [committedSearchTerm, setCommittedSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState([])
  const [showCompleted, setShowCompleted] = useState(false)

  const router = useRouter()
  const filtersFromUrl = router.query.filters?.split(',') || []

  useEffect(() => {
    setSelectedFilters(filtersFromUrl.filter(Boolean))
    setShowCompleted(router.query.completed === 'true')
  }, [router.query])

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true)
      try {
        const res = await fetch(`/api/campaigns`)
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

  const updateUrl = (filters, completed) => {
    const query = {}
    if (filters.length > 0) query.filters = filters.join(',')
    if (completed) query.completed = 'true'
    router.push({ pathname: '/', query }, undefined, { shallow: true })
  }

  const toggleFilter = (key) => {
    const newFilters = selectedFilters.includes(key)
      ? selectedFilters.filter((f) => f !== key)
      : [...selectedFilters, key]
    setSelectedFilters(newFilters)
    updateUrl(newFilters, showCompleted)
  }

  const toggleCompleted = () => {
    const newValue = !showCompleted
    setShowCompleted(newValue)
    updateUrl(selectedFilters, newValue)
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const name = campaign.fields?.["Campagnenaam"]?.toLowerCase() || ""
    const matchSearch = name.includes(committedSearchTerm.toLowerCase())
    if (!matchSearch) return false

    const opgehaald = campaign.fields['Opgehaald bedrag'] || 0
    const doel = campaign.fields['Doelbedrag'] || 1
    const percentage = (opgehaald / doel) * 100

    if (showCompleted) return percentage >= 100
    if (percentage >= 100) return false

    const matches = selectedFilters.every((filter) => {
      if (filter === 'bijna_compleet') return percentage >= 85 && percentage < 100
      if (filter === 'lang_niet_doneren') return campaign.fields['DagenGeenDonatie'] >= 7
      if (filter === 'weeskind') return campaign.fields['Weeskind'] === true
      return true
    })

    return matches
  })

  const totaalOpgehaald = campaigns.reduce((sum, c) => sum + (c.fields['Opgehaald bedrag'] || 0), 0)

  if (loading) return <p style={{ textAlign: 'center' }}>⏳ Laden...</p>
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>❌ Fout: {error}</p>

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#eaf0eb',
        color: '#2e3d2f',
        padding: '2.5rem 1rem 2rem',
        textAlign: 'center',
        borderRadius: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
      }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Steun Gaza rechtstreeks
        </h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Een overzicht van crowdfundingcampagnes voor Gaza – veilig, vertrouwd en direct.
        </p>
        <p style={{ marginTop: '1.2rem', fontSize: '1.05rem', fontWeight: 'bold', color: '#4a5b4c' }}>
          Totaal opgehaald: €{totaalOpgehaald.toLocaleString()}
        </p>
      </div>

      {/* Zoek & filters */}
      <div style={{
        backgroundColor: '#f0f4f1',
        padding: '2rem',
        borderRadius: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          marginBottom: '1rem',
          textAlign: 'center',
          color: '#333',
          fontWeight: '600'
        }}>
          Zoek en filter campagnes
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Zoek op campagnenaam..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setCommittedSearchTerm(searchTerm) }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1px solid #ccc',
              width: '100%',
              maxWidth: '400px',
              fontSize: '1rem'
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', justifyContent: 'center' }}>
            <button
              onClick={() => setCommittedSearchTerm(searchTerm)}
              style={{
                backgroundColor: '#b2c2a2',
                color: 'white',
                padding: '0.5rem 1.2rem',
                border: 'none',
                borderRadius: '999px',
                fontWeight: 'bold',
                cursor: 'pointer',
                minWidth: '120px'
              }}
            >
              Zoek
            </button>
            <button
              onClick={() => {
                setSearchTerm('')
                setCommittedSearchTerm('')
              }}
              style={{
                backgroundColor: '#ff9e80',
                color: 'white',
                padding: '0.5rem 1.2rem',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                minWidth: '120px'
              }}
            >
              Toon alles
            </button>
          </div>
        </div>

        {/* Filterknoppen */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {[
            { key: 'bijna_compleet', label: 'Bijna compleet' },
            { key: 'lang_niet_doneren', label: 'Lang niet gedoneerd' },
            { key: 'weeskind', label: 'Weeskinderen' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              style={{
                backgroundColor: selectedFilters.includes(key) ? '#b2c2a2' : '#e0e0e0',
                color: selectedFilters.includes(key) ? 'white' : '#333',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                minWidth: '140px'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Voltooide campagnes knop */}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            onClick={toggleCompleted}
            style={{
              backgroundColor: showCompleted ? '#4caf50' : 'transparent',
              color: showCompleted ? 'white' : '#4caf50',
              padding: '0.5rem 1.2rem',
              borderRadius: '8px',
              border: '2px solid #4caf50',
              cursor: 'pointer',
              fontWeight: '600',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            {showCompleted ? 'Verberg voltooide campagnes' : 'Toon voltooide campagnes'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#555' }}>
          {filteredCampaigns.length} campagne{filteredCampaigns.length === 1 ? '' : 's'} gevonden
        </p>
      </div>

      {/* Campagnekaarten */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2rem'
      }}>
        {filteredCampaigns.map((c) => {
          const opgehaald = c.fields?.["Opgehaald bedrag"] || 0
          const doel = c.fields?.["Doelbedrag"] || 1
          const percentage = Math.min(Math.round((opgehaald / doel) * 100), 100)
          const afbeelding = Array.isArray(c.fields?.Afbeelding) ? c.fields.Afbeelding[0]?.url : c.fields?.Afbeelding

          return (
            <a
              key={c.id}
              href={c.fields?.["Campagnelink"] || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease',
                textDecoration: 'none',
                color: 'inherit'
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
                <div style={{
                  backgroundColor: '#b2c2a2',
                  color: 'white',
                  textAlign: 'center',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}>
                  Bekijk campagne
                </div>
              </div>
            </a>
          )
        })}
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem', color: '#777' }}>
        <p>Een initiatief van United Muslim Mothers (UMM)</p>
      </footer>

      {/* Back to top */}
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
