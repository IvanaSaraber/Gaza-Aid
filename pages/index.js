import { useEffect, useState } from 'react';

export default function Home() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetch('/api/campaigns')
      .then((res) => res.json())
      .then((data) => setCampaigns(data.records || []));
  }, []);

  return (
    <div>
      <h1>GazaAid Campagnes</h1>
      {campaigns.length === 0 ? (
        <p>Laden...</p>
      ) : (
        <ul>
          {campaigns.map((item) => (
            <li key={item.id}>
              <strong>{item.fields.Titel}</strong><br />
              €{item.fields.Gedoneerd} van €{item.fields.Doelbedrag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
