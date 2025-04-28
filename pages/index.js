import { useEffect, useState } from 'react';

export default function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('');

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('https://gaza-aid-1byz.vercel.app/api/campaigns');
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        setCampaigns(data.records || []);
        setFilteredCampaigns(data.records || []);
      } catch (err) {
        console.error('Fout bij ophalen campagnes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const handleFilter = (filterType) => {
    if (activeFilter === filterType) {
      setFilteredCampaigns(campaigns);
      setActiveFilter('');
      return;
    }

    let filtered = campaigns;

    if (filterType === 'bijna-compleet') {
      filtered = campaigns.filter((c) => {
        const opgehaald = c.fields?.["Opgehaald bedrag"] || 0;
        const doel = c.fields?.["Doelbedrag"] || 1;
        const percentage = (opgehaald / doel) * 100;
        return percentage >= 90 && percentage < 100;
      });
    } else if (filterType === 'nieuw') {
      filtered = campaigns.filter((c) => {
        const gestartOp = new Date(c.fields?.["Startdatum"]);
        const vandaag = new Date();
        const dagenVerschil = (vandaag - gestartOp) / (1000 * 60 * 60 * 24);
        return dagenVerschil <= 7;
      });
    } else if (filterType === 'lang-niet-gedoneerd') {
      filtered = campaigns.filter((c) => {
        const dagenSindsLaatsteDonatie = c.fields?.["Dagen sinds laatste donatie"];
        return dagenSindsLaatsteDonatie >= 7;
      });
    }

    setFilteredCampaigns(filtered);
    setActiveFilter(filterType);
  };

  if (loading) return <p style={{ textAlign: 'center' }}>⏳ Laden...</p>;
  if (error) return <p style={{ textAlign: 'center' }}>❌ Fout: {error}</p>;

  return (
    <div style={{ padding: '2rem 1rem', backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '2rem', color: '#333' }}>
        Help onschuldige burgers in Gaza
      </h1>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button onClick={() => handleFilter('bijna-compleet')} style={{ ...filterButtonStyle, backgroundColor: activeFilter === 'bijna-compleet' ? '#FFB347' : '#ffffff' }}>
          Bijna compleet
        </button>
        <button onClick={() => handleFilter('nieuw')} style={{ ...filterButtonStyle, backgroundColor: activeFilter === 'nieuw' ? '#FFB347' : '#ffffff' }}>
          Nieuw
        </button>
        <button onClick={() => handleFilter('lang-niet-gedoneerd')} style={{ ...filterButtonStyle, backgroundColor: activeFilter === 'lang-niet-gedoneerd' ? '#FFB347' : '#ffffff' }}>
          Lang niet gedoneerd
        </button>
      </div>

      {activeFilter && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button onClick={() => { setFilteredCampaigns(campaigns); setActiveFilter(''); }} style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ccc',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: '#333',
          }}>
            Filters verwijderen
          </button>
        </div>
      )}

      {/* Campagnes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
      }}>
        {filteredCampaigns.map((c) => {
          const opgehaald = c.fields?.["Opgehaald bedrag"] || 0;
          const doel = c.fields?.["Doelbedrag"] || 1;
          const percentage = Math.min(100, ((opgehaald / doel) * 100).toFixed(1));

          return (
            <div key={c.id} style={{
              border: '1px solid #ddd',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease',
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >

              {/* Afbeelding */}
              {c.fields?.Afbeelding ? (
                <img
                  src={Array.isArray(c.fields.Afbeelding) ? c.fields.Afbeelding[0]?.url : c.fields.Afbeelding}
                  alt={c.fields?.["Campagnenaam"] || 'Campagne afbeelding'}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '180px', backgroundColor: '#eee' }} />
              )}

              {/* Inhoud */}
              <div style={{ padding: '1rem', flexGrow: 1 }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#222', lineHeight: '1.2' }}>
                  {c.fields?.["Campagnenaam"] || 'Naamloos'}
                </h2>
                <p style={{ marginBottom: '0.25rem', fontSize: '0.9rem', color: '#555' }}>
                  €{opgehaald.toLocaleString()} van €{doel.toLocaleString()} opgehaald
                </p>

                {/* Progress bar */}
                <div style={{ backgroundColor: '#f1f1f1', borderRadius: '8px', height: '10px', marginTop: '0.5rem', marginBottom: '0.5rem', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percentage}%`,
                    background: 'linear-gradient(90deg, #ff8a00, #e52e71)',
                    height: '100%',
                  }}></div>
                </div>
                <p style={{ fontSize: '0.8rem', textAlign: 'right', color: '#666', marginTop: '-8px' }}>
                  {percentage}% behaald
                </p>
              </div>

              {/* Knop */}
              <div style={{ padding: '0 1rem 1rem' }}>
                <a
                  href={c.fields?.["Campagnelink"] || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    backgroundColor: '#2c7a7b',
                    color: 'white',
                    textAlign: 'center',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s ease',
                    fontSize: '0.95rem',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#285e61'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2c7a7b'}
                >
                  Bekijk campagne
                </a>
              </div>

            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.85rem', color: '#999' }}>
        Een initiatief van <strong>United Muslim Mothers (UMM)</strong>.
      </footer>
    </div>
  )
}

// Styles
const filterButtonStyle = {
  padding: '0.5rem 1rem',
  border: '1px solid #ccc',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  color: '#333',
  backgroundColor: '#fff',
  transition: 'background-color 0.2s ease',
};
