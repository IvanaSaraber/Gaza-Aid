import { useEffect, useState } from 'react';

export default function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    nearComplete: false,
    newCampaigns: false,
    notDonated: false,
  });

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('https://gaza-aid-1byz.vercel.app/api/campaigns');
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        setCampaigns(data.records || []);
      } catch (err) {
        console.error('Fout bij ophalen campagnes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const applyFilters = (campaign) => {
    if (filters.nearComplete && campaign.progress < 90) return false;
    if (filters.newCampaigns && campaign.daysSinceStart > 7) return false;
    if (filters.notDonated && campaign.daysSinceLastDonation < 7) return false;
    return true;
  };

  const clearFilters = () => {
    setFilters({
      nearComplete: false,
      newCampaigns: false,
      notDonated: false,
    });
  };

  if (loading) return <p>⏳ Laden...</p>;
  if (error) return <p>❌ Fout: {error}</p>;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>
        Help onschuldige burgers in Gaza
      </h1>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button
          onClick={() => setFilters({ ...filters, nearComplete: !filters.nearComplete })}
          style={{
            padding: '10px 20px',
            borderRadius: '50px',
            backgroundColor: filters.nearComplete ? '#FF8C00' : '#cccccc',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Bijna Compleet
        </button>
        <button
          onClick={() => setFilters({ ...filters, newCampaigns: !filters.newCampaigns })}
          style={{
            padding: '10px 20px',
            borderRadius: '50px',
            backgroundColor: filters.newCampaigns ? '#FF8C00' : '#cccccc',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Nieuwe Campagnes
        </button>
        <button
          onClick={() => setFilters({ ...filters, notDonated: !filters.notDonated })}
          style={{
            padding: '10px 20px',
            borderRadius: '50px',
            backgroundColor: filters.notDonated ? '#FF8C00' : '#cccccc',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Lang Niet Gedoneerd
        </button>
        <button
          onClick={clearFilters}
          style={{
            padding: '10px 20px',
            borderRadius: '50px',
            backgroundColor: '#cccccc',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Alle Filters Verwijderen
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {campaigns.filter(applyFilters).map((c) => (
          <div
            key={c.id}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
              padding: '1rem',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {/* Afbeelding */}
            {c.fields?.Afbeelding ? (
              <img
                src={Array.isArray(c.fields.Afbeelding) ? c.fields.Afbeelding[0]?.url : c.fields.Afbeelding}
                alt={c.fields?.["Campagnenaam"] || 'Campagne afbeelding'}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '200px', backgroundColor: '#eee' }} />
            )}

            <div style={{ marginTop: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#333' }}>
                {c.fields?.["Campagnenaam"] || 'Naamloos'}
              </h2>
              <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                {c.fields?.["Opgehaald bedrag"] && c.fields?.["Doelbedrag"]
                  ? `${c.fields["Opgehaald bedrag"]} van ${c.fields["Doelbedrag"]} opgehaald`
                  : 'Geen gegevens beschikbaar'}
              </p>
              {/* Voortgangsbalk */}
              <div style={{ marginTop: '1rem', width: '100%' }}>
                <div
                  style={{
                    backgroundColor: '#eee',
                    borderRadius: '8px',
                    height: '12px',
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#FF8C00',
                      height: '100%',
                      width: `${(c.fields["Opgehaald bedrag"] / c.fields["Doelbedrag"]) * 100}%`,
                      borderRadius: '8px',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.9rem',
                      color: '#FF8C00',
                    }}
                  >
                    {Math.round((c.fields["Opgehaald bedrag"] / c.fields["Doelbedrag"]) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <a
                href="#"
                style={{
                  display: 'block',
                  backgroundColor: '#FF8C00',
                  color: 'white',
                  textAlign: 'center',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF7F00'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF8C00'}
              >
                Bekijk campagne
              </a>
            </div>
          </div>
        ))}
      </div>
      <footer style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <p>Een UMM initiatief – United Muslim Mothers</p>
      </footer>
    </div>
  );
}
