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
      {campaigns.length === 0 ? (
        <p>Geen campagnes gevonden.</p>
      ) : (
        <ul>
          {campaigns.map(c => (
            <li key={c.id}>
              <strong>{c.fields?.["Campagnenaam"] || 'Naamloos'}</strong> – €{c.fields?.["Opgehaald bedrag"] || 0}
            </li>

          ))}
        </ul>
      )}
    </div>
  )
}
