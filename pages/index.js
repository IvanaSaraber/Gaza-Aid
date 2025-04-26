import { useEffect, useState } from 'react'

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [daysFilter, setDaysFilter] = useState(0) // 0 voor geen filter, anders het aantal dagen

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

  // Functie om het aantal dagen sinds de campagne is gestart te berekenen
  const calculateDaysOpen = (startDate) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffTime = Math.abs(now - start)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // Converteer naar dagen
  }

  // Filter de campagnes op basis van het aantal dagen
  const filteredCampaigns = campaigns.filter((campaign) => {
    const daysOpen = calculateDaysOpen(campaign.fields?.["Startdatum"]) // Pas aan voor juiste kolomnaam
    return daysFilter === 0 || daysOpen <= daysFilter
  })

  if (loading) return <p>⏳ Laden...</p>
  if (error) return <p>❌ Fout: {error}</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🎯 GazaAid Campagnes</h1>

      {/* Filter Optie */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="daysFilter">Filter op aantal dagen open:</label>
        <select
          id="daysFilter"
          value={daysFilter}
          onChange={(e) => setDaysFilter(Number(e.target.value))}
          style={{ padding: '0.5rem' }}
        >
          <option value={0}>Alle Campagnes</option>
          <option value={7}>Binnen 7 dagen</option>
          <option value={30}>Binnen 30 dagen</option>
          <option value={60}>Binnen 60 dagen</option>
          <option value={90}>Binnen 90 dagen</option>
        </select>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem',
        }}
      >
        {filteredCampaigns.map((c) => {
          const daysOpen = calculateDaysOpen(c.fields?.["Startdatum"])

          return (
            <div
              key={c.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: '#fff',
              }}
            >
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                {c.fields?.["Campagnenaam"] || 'Naamloos'}
              </h2>
              <p><strong>Opgehaald:</strong> €{c.fields?.["Opgehaald bedrag"] || 0}</p>
              <p><strong>Aantal Dagen Open:</strong> {daysOpen} dagen</p>
              <a href={c.fields?.["GoFundMe Link"]} target="_blank" rel="noopener noreferrer">
                Ga naar de campagne
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
