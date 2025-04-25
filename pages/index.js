// pages/index.tsx
import { useEffect, useState } from 'react'

export default function Home() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/campaigns')
      .then((res) => res.json())
      .then((json) => {
        setData(json.records || [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h1>GazaAid campagnes</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {data.map((item) => (
            <li key={item.id}>{item.fields?.Titel}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
