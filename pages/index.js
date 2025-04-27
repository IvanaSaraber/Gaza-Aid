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
