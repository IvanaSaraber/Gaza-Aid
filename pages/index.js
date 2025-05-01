import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Head from 'next/head'

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('/api/airtable')
        setCampaigns(response.data.records)
      } catch (error) {
        console.error('Fout bij ophalen campagnes:', error)
      }
    }

    fetchCampaigns()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Head>
        <title>GazaAid Campagnes</title>
        <meta name="description" content="Overzicht van hulpcampagnes voor Gaza" />
      </Head>

      <main style={{ padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>GazaAid Campagnes</h1>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {campaigns.map((campaign) => (
            <div key={campaign.id} style={{
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '1rem',
              backgroundColor: '#f9f9f9',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                {campaign.fields.Titel}
              </h2>
              {campaign.fields.Foto && (
                <img
                  src={campaign.fields.Foto}
                  alt={campaign.fields.Titel}
                  style={{ width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '0.5rem' }}
                />
              )}
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Bedrag:</strong> {campaign.fields.Bedrag || 'Onbekend'}
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Status:</strong> {campaign.fields.Status || 'Onbekend'}
              </p>
              <a href={campaign.fields.Link} target="_blank" rel="noopener noreferrer"
                 style={{
                   display: 'inline-block',
                   marginTop: '0.5rem',
                   padding: '0.5rem 1rem',
                   backgroundColor: '#b2c2a2',
                   color: 'white',
                   borderRadius: '8px',
                   textDecoration: 'none'
                 }}>
                Bekijk campagne
              </a>
            </div>
          ))}
        </div>
      </main>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#b2c2a2',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            transition: 'opacity 0.3s ease'
          }}
          title="Terug naar boven"
          aria-label="Scroll naar boven"
        >
          ↑
        </button>
      )}
    </>
  )
}
